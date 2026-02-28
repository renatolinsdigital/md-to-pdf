import React from 'react';
import { Text, View, Link, Image } from '@react-pdf/renderer';
import type { Element, Root, RootContent, ElementContent } from 'hast';
import { parseInlineStyle } from './parseInlineStyle';

type HastNode = Root | RootContent | ElementContent;

const HEADING_SIZES: Record<string, number> = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
};

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
    return (node as Root).children.map((child) => hastToReactPdf(child, textColor));
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

function getInlineStyle(node: Element): Record<string, string> {
  const styleStr = typeof node.properties?.style === 'string' ? node.properties.style : '';
  return parseInlineStyle(styleStr);
}

function renderElement(node: Element, textColor: string): React.ReactNode {
  const tag = node.tagName;
  const key = nextKey();
  const inlineStyle = getInlineStyle(node);
  const children = getChildrenPdf(node, textColor);

  // Heading
  if (HEADING_SIZES[tag]) {
    return React.createElement(
      Text,
      {
        key,
        style: {
          fontSize: HEADING_SIZES[tag],
          fontWeight: 700,
          marginTop: 12,
          marginBottom: 6,
          color: inlineStyle.color || textColor,
        },
      },
      ...children,
    );
  }

  switch (tag) {
    case 'p':
      return React.createElement(
        Text,
        {
          key,
          style: {
            fontSize: 12,
            marginBottom: 8,
            lineHeight: 1.6,
            color: inlineStyle.color || textColor,
          },
        },
        ...children,
      );

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

    case 'code': {
      // Check if inside a <pre>
      const isBlock = false; // inline code
      return React.createElement(
        Text,
        {
          key,
          style: {
            fontFamily: 'Courier',
            fontSize: isBlock ? 10 : 11,
            backgroundColor: '#f3f4f6',
            color: inlineStyle.color || '#1f2937',
            padding: isBlock ? 0 : 1,
          },
        },
        ...children,
      );
    }

    case 'pre': {
      // Code block: pre > code
      const codeContent = extractTextContent(node);
      return React.createElement(
        View,
        {
          key,
          style: {
            backgroundColor: '#1e1e1e',
            padding: 12,
            borderRadius: 4,
            marginBottom: 8,
          },
        },
        React.createElement(
          Text,
          {
            style: {
              fontFamily: 'Courier',
              fontSize: 10,
              color: '#d4d4d4',
              lineHeight: 1.5,
            },
          },
          codeContent,
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
        },
        ...children,
      );

    case 'ul':
      return React.createElement(
        View,
        {
          key,
          style: { marginBottom: 8, marginLeft: 4 },
        },
        ...node.children.map((child, i) =>
          renderListItem(child as Element, false, i + 1, textColor),
        ),
      );

    case 'ol':
      return React.createElement(
        View,
        {
          key,
          style: { marginBottom: 8, marginLeft: 4 },
        },
        ...node.children.map((child, i) =>
          renderListItem(child as Element, true, i + 1, textColor),
        ),
      );

    case 'li':
      // Should be handled by ul/ol above, but fallback
      return React.createElement(
        View,
        {
          key,
          style: { flexDirection: 'row', marginBottom: 2 },
        },
        React.createElement(Text, { style: { width: 16, fontSize: 12, color: textColor } }, '• '),
        React.createElement(
          Text,
          { style: { flex: 1, fontSize: 12, color: textColor } },
          ...children,
        ),
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
      if (!src) return null;
      return React.createElement(Image, {
        key,
        src,
        style: { maxWidth: '100%', marginBottom: 8 },
      });
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
      if (inlineStyle.fontWeight)
        spanStyle.fontWeight = Number(inlineStyle.fontWeight) || undefined;
      if (inlineStyle.fontStyle) spanStyle.fontStyle = inlineStyle.fontStyle;
      return React.createElement(
        Text,
        { key, style: spanStyle } as React.ComponentProps<typeof Text> & { key: string },
        ...children,
      );
    }

    case 'div':
      return React.createElement(View, { key }, ...children);

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
      return React.createElement(View, { key }, ...children);

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

  if (checkbox) {
    const checked = checkbox.properties?.checked;
    return React.createElement(
      View,
      { key, style: { flexDirection: 'row', marginBottom: 2, marginLeft: 8 } },
      React.createElement(
        Text,
        { style: { width: 20, fontSize: 12, color: textColor } },
        checked ? '☑ ' : '☐ ',
      ),
      React.createElement(
        Text,
        { style: { flex: 1, fontSize: 12, lineHeight: 1.6, color: textColor } },
        ...children.filter((c) => !(React.isValidElement(c) && c.type === 'input')),
      ),
    );
  }

  return React.createElement(
    View,
    { key, style: { flexDirection: 'row', marginBottom: 2, marginLeft: 8 } },
    React.createElement(Text, { style: { width: 20, fontSize: 12, color: textColor } }, bullet),
    React.createElement(
      Text,
      { style: { flex: 1, fontSize: 12, lineHeight: 1.6, color: textColor } },
      ...children,
    ),
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
              React.createElement(
                Text,
                {
                  style: {
                    fontSize: 10,
                    fontWeight: isHeader ? 700 : 400,
                    color: textColor,
                  },
                },
                ...cellChildren,
              ),
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
            },
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
