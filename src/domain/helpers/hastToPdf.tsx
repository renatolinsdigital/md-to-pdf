import React from 'react';
import { Text, View, Link, Image } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Element, Root, RootContent, ElementContent } from 'hast';
import { refractor } from 'refractor';
import { parseInlineStyle } from './parseInlineStyle';

type HastNode = Root | RootContent | ElementContent;

/** Tags whose rendered output is a <Text> (or nested inside one) and can live inside a parent <Text>. */
const INLINE_TAGS = new Set([
  'strong',
  'b',
  'em',
  'i',
  'del',
  's',
  'u',
  'code',
  'span',
  'a',
  'sup',
  'sub',
  'br',
  'mark',
  'abbr',
  'small',
  'big',
  'input',
]);

/** Return true when every child of `node` can be placed inside a <Text>. */
function allChildrenInline(node: Element): boolean {
  return node.children.every((c) => {
    if (c.type === 'text') return true;
    if (c.type === 'element') return INLINE_TAGS.has(c.tagName);
    return false;
  });
}

const HEADING_SIZES: Record<string, number> = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
};

// ── One Dark inspired token colours ──────────────────────────────
const TOKEN_COLORS: Record<string, string> = {
  keyword: '#c678dd',
  string: '#98c379',
  comment: '#5c6370',
  number: '#d19a66',
  boolean: '#d19a66',
  function: '#61afef',
  'function-variable': '#61afef',
  'class-name': '#e5c07b',
  operator: '#56b6c2',
  punctuation: '#abb2bf',
  property: '#e06c75',
  tag: '#e06c75',
  'attr-name': '#d19a66',
  'attr-value': '#98c379',
  regex: '#98c379',
  builtin: '#e5c07b',
  variable: '#e06c75',
  constant: '#d19a66',
  parameter: '#e06c75',
  'template-string': '#98c379',
  'template-punctuation': '#98c379',
  interpolation: '#e06c75',
  'triple-quoted-string': '#98c379',
  'doc-comment': '#5c6370',
  'literal-property': '#e06c75',
  selector: '#e06c75',
  atrule: '#c678dd',
  important: '#c678dd',
  deleted: '#e06c75',
  inserted: '#98c379',
  changed: '#e5c07b',
};

function tokenColor(classNames: string[]): string {
  for (const cn of classNames) {
    if (cn !== 'token' && TOKEN_COLORS[cn]) return TOKEN_COLORS[cn];
  }
  return '#abb2bf';
}

/** Walk refractor HAST and produce coloured <Text> spans. */
function renderCodeHastNodes(nodes: (RootContent | ElementContent)[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  for (const n of nodes) {
    if (n.type === 'text') {
      result.push(n.value);
    } else if (n.type === 'element') {
      const classes = (n.properties?.className ?? []) as string[];
      const color = tokenColor(classes);
      const inner = renderCodeHastNodes(n.children);
      result.push(React.createElement(Text, { key: nextKey(), style: { color } }, ...inner));
    }
  }
  return result;
}

let keyCounter = 0;
function nextKey(): string {
  return `pdf-${keyCounter++}`;
}

export function resetKeyCounter() {
  keyCounter = 0;
}

/**
 * Recursively convert a HAST tree to @react-pdf/renderer elements.
 */
export function hastToReactPdf(node: HastNode, textColor: string = '#000000'): React.ReactNode {
  if (node.type === 'root') {
    const children = (node as Root).children.map((child) => hastToReactPdf(child, textColor));
    return blockChildren(children, textColor);
  }

  if (node.type === 'text') {
    return node.value;
  }

  if (node.type === 'comment' || node.type === 'doctype') {
    return null;
  }

  if (node.type === 'element') {
    return renderElement(node, textColor);
  }

  return null;
}

function getChildrenPdf(node: Element, textColor: string): React.ReactNode[] {
  return node.children.map((child) => hastToReactPdf(child, textColor));
}

/**
 * Wrap any raw string children in <Text> so they can safely appear inside a View.
 * Whitespace-only strings are discarded.
 */
function blockChildren(children: React.ReactNode[], textColor: string): React.ReactNode[] {
  return children
    .flat()
    .map((child) => {
      if (typeof child === 'string') {
        if (child.trim() === '') return null;
        return React.createElement(
          Text,
          { key: nextKey(), style: { fontSize: 12, color: textColor } },
          child,
        );
      }
      if (typeof child === 'number') {
        return React.createElement(
          Text,
          { key: nextKey(), style: { fontSize: 12, color: textColor } },
          String(child),
        );
      }
      return child;
    })
    .filter((c) => c != null);
}

function getInlineStyle(node: Element): Record<string, string> {
  const styleStr = typeof node.properties?.style === 'string' ? node.properties.style : '';
  return parseInlineStyle(styleStr);
}

const TEXT_ALIGN_MAP: Record<string, 'flex-start' | 'center' | 'flex-end'> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

function renderElement(node: Element, textColor: string): React.ReactNode {
  const tag = node.tagName;
  const key = nextKey();
  const inlineStyle = getInlineStyle(node);
  const children = getChildrenPdf(node, textColor);

  // Heading - keep together with at least some following content
  if (HEADING_SIZES[tag]) {
    return React.createElement(
      View,
      {
        key,
        style: { marginTop: 12, marginBottom: 6 },
        minPresenceAhead: 40,
        wrap: false,
      } as React.ComponentProps<typeof View> & { key: string },
      React.createElement(
        Text,
        {
          style: {
            fontSize: HEADING_SIZES[tag],
            fontWeight: 700,
            color: inlineStyle.color || textColor,
          },
        },
        ...children,
      ),
    );
  }

  switch (tag) {
    case 'p': {
      // When every child is inline-safe, render as <Text> for proper
      // text wrapping; otherwise fall back to <View> so block-level
      // children like <Image> (from ![alt](url)) don't nest inside
      // a <Text> - which causes @react-pdf to produce NaN in layout.
      const pInline = allChildrenInline(node);
      const pAlign = inlineStyle.textAlign as Style['textAlign'];

      if (pInline) {
        const pTextStyle: Style = {
          fontSize: 12,
          marginBottom: 8,
          lineHeight: 1.6,
          color: inlineStyle.color || textColor,
        };
        if (pAlign) pTextStyle.textAlign = pAlign;

        // For centered/right-aligned captions, wrap in a View so
        // alignment works across the full width.
        if (pAlign && pAlign !== 'left') {
          const alignKey = inlineStyle.textAlign ?? 'left';
          return React.createElement(
            View,
            {
              key,
              style: {
                marginTop: -14,
                marginBottom: 8,
                alignItems: TEXT_ALIGN_MAP[alignKey] || 'flex-start',
                width: '100%',
              },
            },
            React.createElement(
              Text,
              { style: pTextStyle } as React.ComponentProps<typeof Text>,
              ...children,
            ),
          );
        }
        return React.createElement(
          Text,
          { key, style: pTextStyle } as React.ComponentProps<typeof Text> & { key: string },
          ...children,
        );
      }

      const pViewStyle: Style = { marginBottom: 8 };
      if (inlineStyle.textAlign && TEXT_ALIGN_MAP[inlineStyle.textAlign]) {
        pViewStyle.alignItems = TEXT_ALIGN_MAP[inlineStyle.textAlign];
      }
      return React.createElement(
        View,
        { key, style: pViewStyle },
        ...blockChildren(children, textColor),
      );
    }

    case 'strong':
    case 'b':
      return React.createElement(
        Text,
        {
          key,
          style: {
            fontWeight: 700,
            color: inlineStyle.color || undefined,
          },
        },
        ...children,
      );

    case 'em':
    case 'i':
      return React.createElement(
        Text,
        {
          key,
          style: {
            fontStyle: 'italic',
            color: inlineStyle.color || undefined,
          },
        },
        ...children,
      );

    case 'del':
    case 's':
      return React.createElement(
        Text,
        {
          key,
          style: {
            textDecoration: 'line-through',
            color: inlineStyle.color || undefined,
          },
        },
        ...children,
      );

    case 'u':
      return React.createElement(
        Text,
        {
          key,
          style: {
            textDecoration: 'underline',
            color: inlineStyle.color || undefined,
          },
        },
        ...children,
      );

    case 'code':
      return React.createElement(
        Text,
        {
          key,
          style: {
            fontFamily: 'Courier',
            fontSize: 11,
            backgroundColor: '#f3f4f6',
            color: inlineStyle.color || '#1f2937',
            padding: 1,
          },
        },
        ...children,
      );

    case 'pre': {
      // Code block: pre > code - extract language and syntax-highlight
      const codeNode = node.children.find((c) => c.type === 'element' && c.tagName === 'code') as
        | Element
        | undefined;
      const codeContent = extractTextContent(node);
      const langClass = ((codeNode?.properties?.className ?? []) as string[]).find((c) =>
        c.startsWith('language-'),
      );
      const lang = langClass ? langClass.replace('language-', '') : '';

      let codeChildren: React.ReactNode[];
      if (lang) {
        try {
          const highlighted = refractor.highlight(codeContent, lang);
          codeChildren = renderCodeHastNodes(highlighted.children);
        } catch {
          // Unsupported language - plain monochrome
          codeChildren = [codeContent];
        }
      } else {
        codeChildren = [codeContent];
      }

      return React.createElement(
        View,
        {
          key,
          style: {
            backgroundColor: '#282c34',
            padding: 12,
            borderRadius: 4,
            marginBottom: 8,
          },
          wrap: false,
        } as React.ComponentProps<typeof View> & { key: string },
        React.createElement(
          Text,
          {
            style: {
              fontFamily: 'Courier',
              fontSize: 10,
              color: '#abb2bf',
              lineHeight: 1.5,
            },
          },
          ...codeChildren,
        ),
      );
    }

    case 'blockquote':
      return React.createElement(
        View,
        {
          key,
          style: {
            borderLeftWidth: 3,
            borderLeftColor: '#d1d5db',
            paddingLeft: 10,
            marginBottom: 8,
            marginLeft: 4,
          },
          wrap: false,
        } as React.ComponentProps<typeof View> & { key: string },
        ...blockChildren(children, textColor),
      );

    case 'ul': {
      const listItems = node.children
        .filter((c): c is Element => c.type === 'element' && c.tagName === 'li')
        .map((child, i) => renderListItem(child, false, i + 1, textColor));
      return React.createElement(
        View,
        { key, style: { marginBottom: 8, marginLeft: 4 } },
        ...listItems,
      );
    }

    case 'ol': {
      const orderedItems = node.children
        .filter((c): c is Element => c.type === 'element' && c.tagName === 'li')
        .map((child, i) => renderListItem(child, true, i + 1, textColor));
      return React.createElement(
        View,
        { key, style: { marginBottom: 8, marginLeft: 4 } },
        ...orderedItems,
      );
    }

    case 'li':
      // Should be handled by ul/ol above, but fallback
      return React.createElement(
        View,
        {
          key,
          style: { flexDirection: 'row', marginBottom: 2 },
        },
        React.createElement(Text, { style: { width: 16, fontSize: 12, color: textColor } }, '• '),
        React.createElement(View, { style: { flex: 1 } }, ...blockChildren(children, textColor)),
      );

    case 'a': {
      const href = String(node.properties?.href || '');
      return React.createElement(
        Link,
        { key, src: href },
        React.createElement(
          Text,
          { style: { color: '#4f46e5', textDecoration: 'underline', fontSize: 12 } },
          ...children,
        ),
      );
    }

    case 'img': {
      const src = String(node.properties?.src || '');

      // Skip empty, SVG, and non-JPEG/PNG data-URLs
      if (!src || src.startsWith('data:image/svg') || /\.svg(\?|$)/i.test(src)) {
        return null;
      }
      if (src.startsWith('data:') && !/^data:image\/(jpeg|png);base64,/.test(src)) {
        return null;
      }

      return React.createElement(
        View,
        {
          key,
          style: {
            width: '100%',
            marginBottom: 8,
            alignItems: 'flex-start',
          },
          wrap: false,
        } as React.ComponentProps<typeof View> & { key: string },
        React.createElement(Image, {
          src: src,
          style: { width: '100%', objectFit: 'contain' as const },
        }),
      );
    }

    case 'hr':
      return React.createElement(View, {
        key,
        style: {
          borderBottomWidth: 1,
          borderBottomColor: '#d1d5db',
          marginTop: 10,
          marginBottom: 10,
        },
      });

    case 'br':
      return React.createElement(Text, { key }, '\n');

    case 'table':
      return renderTable(node, key, textColor);

    case 'span': {
      const spanStyle: {
        color?: string;
        backgroundColor?: string;
        fontWeight?: number;
        fontStyle?: string;
      } = {};
      if (inlineStyle.color) spanStyle.color = inlineStyle.color;
      if (inlineStyle.backgroundColor) spanStyle.backgroundColor = inlineStyle.backgroundColor;
      if (inlineStyle.fontWeight) {
        const fw = Number(inlineStyle.fontWeight);
        if (!Number.isNaN(fw)) spanStyle.fontWeight = fw;
      }
      if (inlineStyle.fontStyle) spanStyle.fontStyle = inlineStyle.fontStyle;
      return React.createElement(
        Text,
        { key, style: spanStyle } as React.ComponentProps<typeof Text> & { key: string },
        ...children,
      );
    }

    case 'div': {
      const align = inlineStyle.textAlign;
      const divStyle: Record<string, string> = {};
      if (align && TEXT_ALIGN_MAP[align]) {
        divStyle.alignItems = TEXT_ALIGN_MAP[align];
      }
      return React.createElement(
        View,
        { key, style: divStyle },
        ...blockChildren(children, textColor),
      );
    }

    case 'sup':
      return React.createElement(
        Text,
        { key, style: { fontSize: 8, verticalAlign: 'super' } },
        ...children,
      );

    case 'sub':
      return React.createElement(Text, { key, style: { fontSize: 8 } }, ...children);

    // Ignore wrapper elements - pass through children
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'section':
    case 'article':
    case 'main':
    case 'aside':
    case 'header':
    case 'footer':
    case 'nav':
      return React.createElement(View, { key }, ...blockChildren(children, textColor));

    default:
      // For unknown tags, attempt to render children as text
      if (children.length > 0) {
        return React.createElement(
          Text,
          { key, style: { fontSize: 12, color: textColor } },
          ...children,
        );
      }
      return null;
  }
}

function renderListItem(
  node: Element | RootContent,
  ordered: boolean,
  index: number,
  textColor: string,
): React.ReactNode {
  if (!node || node.type !== 'element' || node.tagName !== 'li') {
    return null;
  }

  const key = nextKey();
  const bullet = ordered ? `${index}. ` : '• ';
  const children = getChildrenPdf(node, textColor);

  // Check for task list item
  const checkbox = node.children.find(
    (c) => c.type === 'element' && c.tagName === 'input' && c.properties?.type === 'checkbox',
  ) as Element | undefined;

  const inline = allChildrenInline(node);

  if (checkbox) {
    const checked = checkbox.properties?.checked;
    const filtered = children.filter((c) => !(React.isValidElement(c) && c.type === 'input'));
    const contentEl = inline
      ? React.createElement(
          Text,
          { style: { flex: 1, fontSize: 12, lineHeight: 1.6, color: textColor } },
          ...filtered,
        )
      : React.createElement(View, { style: { flex: 1 } }, ...blockChildren(filtered, textColor));
    return React.createElement(
      View,
      { key, style: { flexDirection: 'row', marginBottom: 2, marginLeft: 8 } },
      React.createElement(
        Text,
        { style: { width: 20, fontSize: 12, color: textColor } },
        checked ? '☑ ' : '☐ ',
      ),
      contentEl,
    );
  }

  // When every child is inline-safe, use a single <Text> for horizontal flow;
  // otherwise fall back to <View> which stacks children vertically.
  const contentEl = inline
    ? React.createElement(
        Text,
        { style: { flex: 1, fontSize: 12, lineHeight: 1.6, color: textColor } },
        ...children,
      )
    : React.createElement(View, { style: { flex: 1 } }, ...blockChildren(children, textColor));

  return React.createElement(
    View,
    { key, style: { flexDirection: 'row', marginBottom: 2, marginLeft: 8 } },
    React.createElement(Text, { style: { width: 20, fontSize: 12, color: textColor } }, bullet),
    contentEl,
  );
}

function renderTable(node: Element, key: string, textColor: string): React.ReactNode {
  const rows: React.ReactNode[] = [];
  let isFirstRow = true;

  function processTableChildren(parent: Element) {
    for (const child of parent.children) {
      if (child.type !== 'element') continue;

      if (child.tagName === 'thead' || child.tagName === 'tbody' || child.tagName === 'tfoot') {
        processTableChildren(child);
        if (child.tagName === 'thead') isFirstRow = false;
        continue;
      }

      if (child.tagName === 'tr') {
        const rowKey = nextKey();
        const cells = child.children
          .filter(
            (c): c is Element => c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th'),
          )
          .map((cell) => {
            const cellKey = nextKey();
            const isHeader = cell.tagName === 'th' || isFirstRow;
            const cellChildren = getChildrenPdf(cell, textColor);

            // If all cell HAST children are inline, wrap in a single <Text>;
            // otherwise use blockChildren for complex content.
            const cellInline = allChildrenInline(cell);
            const wrappedCellChildren = cellInline
              ? [
                  React.createElement(
                    Text,
                    {
                      key: nextKey(),
                      style: {
                        fontSize: 10,
                        fontWeight: isHeader ? 700 : 400,
                        color: textColor,
                      },
                    },
                    ...cellChildren,
                  ),
                ]
              : blockChildren(cellChildren, textColor);

            return React.createElement(
              View,
              {
                key: cellKey,
                style: {
                  flex: 1,
                  padding: 6,
                  borderRightWidth: 1,
                  borderRightColor: '#d1d5db',
                  borderBottomWidth: 1,
                  borderBottomColor: '#d1d5db',
                },
              },
              ...wrappedCellChildren,
            );
          });

        rows.push(
          React.createElement(
            View,
            {
              key: rowKey,
              style: {
                flexDirection: 'row',
                backgroundColor: isFirstRow ? '#f3f4f6' : 'transparent',
              },
              wrap: false,
            } as React.ComponentProps<typeof View> & { key: string },
            ...cells,
          ),
        );

        if (isFirstRow) isFirstRow = false;
      }
    }
  }

  processTableChildren(node);

  return React.createElement(
    View,
    {
      key,
      style: {
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 2,
      },
    },
    ...rows,
  );
}

function extractTextContent(node: HastNode): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) {
    return (node.children as HastNode[]).map(extractTextContent).join('');
  }
  return '';
}
