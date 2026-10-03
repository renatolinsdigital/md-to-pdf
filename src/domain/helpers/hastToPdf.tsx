import { cloneElement, isValidElement, type ReactNode } from 'react';
import { Text, View, Link, Image } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Element, Root, RootContent } from 'hast';
import { refractor } from 'refractor';
import { parseInlineStyle } from './parseInlineStyle';
import { isEmbeddableDataUrl } from './resolveImages';

const BODY_FONT_SIZE = 12;
const BORDER_COLOR = '#d1d5db';
const SUBTLE_BACKGROUND = '#f3f4f6';
const LINK_COLOR = '#4f46e5';
const CODE_BACKGROUND = '#282c34';
const CODE_TEXT = '#abb2bf';

const HEADING_SIZES: Record<string, number> = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
};

/** Inline tags that only change how their text looks. */
const INLINE_TEXT_STYLES: Record<string, Style> = {
  strong: { fontWeight: 700 },
  b: { fontWeight: 700 },
  em: { fontStyle: 'italic' },
  i: { fontStyle: 'italic' },
  del: { textDecoration: 'line-through' },
  s: { textDecoration: 'line-through' },
  u: { textDecoration: 'underline' },
  sup: { fontSize: 8, verticalAlign: 'super' },
  sub: { fontSize: 8 },
};

/** Tags rendered as (or inside) a <Text>, so they can sit inside a parent <Text>. */
const INLINE_TAGS = new Set([
  ...Object.keys(INLINE_TEXT_STYLES),
  'code',
  'span',
  'a',
  'br',
  'mark',
  'abbr',
  'small',
  'big',
  'input',
]);

/** Structural wrappers whose children are rendered as-is. */
const PASSTHROUGH_TAGS = new Set([
  'thead',
  'tbody',
  'tfoot',
  'section',
  'article',
  'main',
  'aside',
  'header',
  'footer',
  'nav',
]);

const TABLE_SECTIONS = new Set(['thead', 'tbody', 'tfoot']);

const TEXT_ALIGN_TO_FLEX: Record<string, 'flex-start' | 'center' | 'flex-end'> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

// One Dark inspired syntax colours
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

const styles = {
  body: { fontSize: BODY_FONT_SIZE },
  heading: { marginTop: 12, marginBottom: 6 },
  paragraph: { fontSize: BODY_FONT_SIZE, marginBottom: 8, lineHeight: 1.6 },
  // Pulls centred/right-aligned captions up under the image they describe
  alignedParagraph: { marginTop: -14, marginBottom: 8, width: '100%' },
  block: { marginBottom: 8 },
  inlineCode: {
    fontFamily: 'Courier',
    fontSize: 11,
    backgroundColor: SUBTLE_BACKGROUND,
    color: '#1f2937',
    padding: 1,
  },
  codeBlock: { backgroundColor: CODE_BACKGROUND, padding: 12, borderRadius: 4, marginBottom: 8 },
  codeText: { fontFamily: 'Courier', fontSize: 10, color: CODE_TEXT, lineHeight: 1.5 },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: BORDER_COLOR,
    paddingLeft: 10,
    marginBottom: 8,
    marginLeft: 4,
  },
  list: { marginBottom: 8, marginLeft: 4 },
  listItem: { flexDirection: 'row', marginBottom: 2, marginLeft: 8 },
  listMarker: { width: 20, fontSize: BODY_FONT_SIZE },
  listContent: { flex: 1, fontSize: BODY_FONT_SIZE, lineHeight: 1.6 },
  fill: { flex: 1 },
  link: { color: LINK_COLOR, textDecoration: 'underline', fontSize: BODY_FONT_SIZE },
  imageFrame: { width: '100%', marginBottom: 8, alignItems: 'flex-start' },
  image: { width: '100%', objectFit: 'contain' },
  rule: { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, marginTop: 10, marginBottom: 10 },
  table: { marginBottom: 8, borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 2 },
  tableRow: { flexDirection: 'row' },
  tableHeaderRow: { backgroundColor: SUBTLE_BACKGROUND },
  tableCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  tableCellText: { fontSize: 10, fontWeight: 400 },
  tableHeaderText: { fontWeight: 700 },
} satisfies Record<string, Style>;

/** Converts a HAST tree into @react-pdf/renderer elements. */
export function hastToReactPdf(tree: Root, textColor = '#000000'): ReactNode[] {
  return asBlockChildren(renderNodes(tree.children, textColor), textColor);
}

/**
 * Keys elements by position so they can be rendered as a list. The whole tree
 * is rebuilt on every render and holds no state, so positions are stable enough.
 */
function withIndexKeys(nodes: ReactNode[]): ReactNode[] {
  return nodes.map((node, index) =>
    isValidElement(node) ? cloneElement(node, { key: index }) : node,
  );
}

function renderNodes(nodes: RootContent[], textColor: string): ReactNode[] {
  return withIndexKeys(nodes.map((node) => renderNode(node, textColor)));
}

function renderNode(node: RootContent, textColor: string): ReactNode {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return renderElement(node, textColor);
  return null; // comments, doctypes
}

/** A <View> can't hold raw strings: wrap stray text in <Text> and drop whitespace-only runs. */
function asBlockChildren(children: ReactNode[], textColor: string): ReactNode[] {
  return children.map((child, index) => {
    if (typeof child !== 'string') return child;
    return child.trim() ? (
      <Text key={index} style={[styles.body, { color: textColor }]}>
        {child}
      </Text>
    ) : null;
  });
}

/** True when every child can be placed inside a <Text>. */
function allChildrenInline(node: Element): boolean {
  return node.children.every(
    (child) =>
      child.type === 'text' || (child.type === 'element' && INLINE_TAGS.has(child.tagName)),
  );
}

function childElements(node: Element, ...tagNames: string[]): Element[] {
  return node.children.filter(
    (child): child is Element => child.type === 'element' && tagNames.includes(child.tagName),
  );
}

function toFlexAlign(textAlign: string | undefined) {
  return textAlign ? TEXT_ALIGN_TO_FLEX[textAlign] : undefined;
}

function renderElement(node: Element, textColor: string): ReactNode {
  const tag = node.tagName;
  const css = parseInlineStyle(
    typeof node.properties.style === 'string' ? node.properties.style : undefined,
  );
  const children = renderNodes(node.children, textColor);

  const headingSize = HEADING_SIZES[tag];
  if (headingSize) {
    // Never leave a heading stranded at the bottom of a page
    return (
      <View style={styles.heading} minPresenceAhead={40} wrap={false}>
        <Text style={{ fontSize: headingSize, fontWeight: 700, color: css.color || textColor }}>
          {children}
        </Text>
      </View>
    );
  }

  const inlineTextStyle = INLINE_TEXT_STYLES[tag];
  if (inlineTextStyle) {
    return <Text style={[inlineTextStyle, { color: css.color }]}>{children}</Text>;
  }

  if (PASSTHROUGH_TAGS.has(tag)) {
    return <View>{asBlockChildren(children, textColor)}</View>;
  }

  switch (tag) {
    case 'p':
      return renderParagraph(node, children, css, textColor);

    case 'code':
      return <Text style={[styles.inlineCode, { color: css.color }]}>{children}</Text>;

    case 'pre':
      return (
        <View style={styles.codeBlock} wrap={false}>
          <Text style={styles.codeText}>{highlightCode(node)}</Text>
        </View>
      );

    case 'blockquote':
      return (
        <View style={styles.blockquote} wrap={false}>
          {asBlockChildren(children, textColor)}
        </View>
      );

    case 'ul':
    case 'ol':
      return (
        <View style={styles.list}>
          {withIndexKeys(
            childElements(node, 'li').map((li, i) =>
              renderListItem(li, tag === 'ol' ? `${i + 1}. ` : '• ', textColor),
            ),
          )}
        </View>
      );

    case 'li': // only reached for a stray <li> outside a list
      return renderListItem(node, '• ', textColor);

    case 'a':
      return (
        <Link src={String(node.properties.href || '')}>
          <Text style={styles.link}>{children}</Text>
        </Link>
      );

    case 'img': {
      const src = String(node.properties.src || '');
      if (!isRenderableImage(src)) return null;
      return (
        <View style={styles.imageFrame} wrap={false}>
          <Image src={src} style={styles.image} />
        </View>
      );
    }

    case 'hr':
      return <View style={styles.rule} />;

    case 'br':
      return <Text>{'\n'}</Text>;

    case 'table':
      return renderTable(node, textColor);

    case 'span':
      return <Text style={spanStyle(css)}>{children}</Text>;

    case 'div':
      return (
        <View style={{ alignItems: toFlexAlign(css.textAlign) }}>
          {asBlockChildren(children, textColor)}
        </View>
      );

    default:
      // Unknown tags: keep their text rather than dropping it
      return children.length > 0 ? (
        <Text style={[styles.body, { color: textColor }]}>{children}</Text>
      ) : null;
  }
}

function renderParagraph(
  node: Element,
  children: ReactNode[],
  css: Record<string, string>,
  textColor: string,
): ReactNode {
  // A <Text> wraps lines properly but can't hold block content such as an
  // <Image> (react-pdf lays that out as NaN), so mixed paragraphs use a <View>.
  if (!allChildrenInline(node)) {
    return (
      <View style={[styles.block, { alignItems: toFlexAlign(css.textAlign) }]}>
        {asBlockChildren(children, textColor)}
      </View>
    );
  }

  const textAlign = css.textAlign as Style['textAlign'];
  const text = (
    <Text style={[styles.paragraph, { color: css.color || textColor, textAlign }]}>{children}</Text>
  );

  // Aligned paragraphs (typically image captions) need a full-width box to align within
  if (textAlign && textAlign !== 'left') {
    return (
      <View
        style={[styles.alignedParagraph, { alignItems: toFlexAlign(textAlign) ?? 'flex-start' }]}
      >
        {text}
      </View>
    );
  }
  return text;
}

function renderListItem(li: Element, marker: string, textColor: string): ReactNode {
  const checkbox = childElements(li, 'input').find((input) => input.properties.type === 'checkbox');
  const bullet = checkbox ? (checkbox.properties.checked ? '☑ ' : '☐ ') : marker;
  const children = renderNodes(li.children, textColor);

  return (
    <View style={styles.listItem}>
      <Text style={[styles.listMarker, { color: textColor }]}>{bullet}</Text>
      {/* Inline-only items flow as one line of text; anything else stacks */}
      {allChildrenInline(li) ? (
        <Text style={[styles.listContent, { color: textColor }]}>{children}</Text>
      ) : (
        <View style={styles.fill}>{asBlockChildren(children, textColor)}</View>
      )}
    </View>
  );
}

function renderTable(table: Element, textColor: string): ReactNode {
  // The first row is styled as the header, whether or not it sits in a <thead>
  const rows = tableRows(table).map((row, rowIndex) => {
    const isHeaderRow = rowIndex === 0;
    return (
      <View style={[styles.tableRow, isHeaderRow ? styles.tableHeaderRow : {}]} wrap={false}>
        {withIndexKeys(
          childElements(row, 'td', 'th').map((cell) =>
            renderTableCell(cell, isHeaderRow || cell.tagName === 'th', textColor),
          ),
        )}
      </View>
    );
  });

  return <View style={styles.table}>{withIndexKeys(rows)}</View>;
}

function tableRows(node: Element): Element[] {
  return node.children.flatMap((child) => {
    if (child.type !== 'element') return [];
    if (child.tagName === 'tr') return [child];
    return TABLE_SECTIONS.has(child.tagName) ? tableRows(child) : [];
  });
}

function renderTableCell(cell: Element, isHeader: boolean, textColor: string): ReactNode {
  const children = renderNodes(cell.children, textColor);
  return (
    <View style={styles.tableCell}>
      {allChildrenInline(cell) ? (
        <Text
          style={[
            styles.tableCellText,
            isHeader ? styles.tableHeaderText : {},
            { color: textColor },
          ]}
        >
          {children}
        </Text>
      ) : (
        asBlockChildren(children, textColor)
      )}
    </View>
  );
}

function spanStyle(css: Record<string, string>): Style {
  const style: Style = {};
  if (css.color) style.color = css.color;
  if (css.backgroundColor) style.backgroundColor = css.backgroundColor;
  if (css.fontStyle) style.fontStyle = css.fontStyle as Style['fontStyle'];
  const fontWeight = Number(css.fontWeight);
  if (css.fontWeight && !Number.isNaN(fontWeight)) style.fontWeight = fontWeight;
  return style;
}

/** SVGs and data-URLs other than JPEG/PNG make react-pdf fail, so they are skipped. */
function isRenderableImage(src: string): boolean {
  if (!src || /\.svg(\?|$)/i.test(src)) return false;
  return !src.startsWith('data:') || isEmbeddableDataUrl(src);
}

/** Syntax-highlights a `<pre><code class="language-x">` block into coloured <Text> runs. */
function highlightCode(pre: Element): ReactNode[] {
  const source = textContent(pre);
  const code = childElements(pre, 'code')[0];
  const language = classList(code)
    .find((cls) => cls.startsWith('language-'))
    ?.slice('language-'.length);

  if (!language || !refractor.registered(language)) return [source];
  return renderTokens(refractor.highlight(source, language).children);
}

function renderTokens(nodes: RootContent[]): ReactNode[] {
  return withIndexKeys(
    nodes.map((node) => {
      if (node.type === 'text') return node.value;
      if (node.type !== 'element') return null;
      return (
        <Text style={{ color: tokenColor(classList(node)) }}>{renderTokens(node.children)}</Text>
      );
    }),
  );
}

function tokenColor(classes: string[]): string {
  for (const cls of classes) {
    const color = TOKEN_COLORS[cls];
    if (color) return color;
  }
  return CODE_TEXT;
}

function classList(node: Element | undefined): string[] {
  const className = node?.properties.className;
  return Array.isArray(className) ? className.map(String) : [];
}

function textContent(node: RootContent): string {
  if (node.type === 'text') return node.value;
  return node.type === 'element' ? node.children.map(textContent).join('') : '';
}
