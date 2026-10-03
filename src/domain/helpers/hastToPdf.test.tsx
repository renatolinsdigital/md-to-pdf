import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { Document, Image, Page, pdf } from '@react-pdf/renderer';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { hastToReactPdf } from './hastToPdf';
import { parseMarkdown } from './parseMarkdown';

// react-pdf elements aren't DOM nodes, so these tests walk the element tree directly.

type PdfElement = ReactElement<{ children?: ReactNode; style?: unknown }>;

function render(markdown: string): ReactNode[] {
  const tree = parseMarkdown(markdown);
  if (!tree) throw new Error('Expected markdown to parse');
  return hastToReactPdf(tree);
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  return isValidElement<{ children?: ReactNode }>(node) ? textOf(node.props.children) : '';
}

function findElements(node: ReactNode, match: (el: PdfElement) => boolean): PdfElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, match));
  if (!isValidElement<{ children?: ReactNode }>(node)) return [];
  const el = node as PdfElement;
  return [...(match(el) ? [el] : []), ...findElements(el.props.children, match)];
}

/** Flattens a react-pdf style (object or array of objects) into one object. */
function flatStyle(el: PdfElement): Record<string, unknown> {
  const styles = [el.props.style].flat() as Record<string, unknown>[];
  return Object.assign({}, ...styles);
}

describe('hastToReactPdf', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders inline formatting as nested text runs', () => {
    const output = render('Some **bold** text');

    const bold = findElements(output, (el) => flatStyle(el).fontWeight === 700);
    expect(textOf(output)).toBe('Some bold text');
    expect(bold.map(textOf)).toEqual(['bold']);
  });

  it('numbers ordered list items and marks task list items', () => {
    expect(textOf(render('1. one\n2. two'))).toBe('1. one2. two');
    expect(textOf(render('- [x] done\n- [ ] todo'))).toContain('☑ ');
    expect(textOf(render('- [x] done\n- [ ] todo'))).toContain('☐ ');
  });

  it('colours highlighted code tokens', () => {
    const output = render('```js\nconst x = 1;\n```');

    const keyword = findElements(output, (el) => textOf(el) === 'const' && !!flatStyle(el).color);
    expect(keyword[0] && flatStyle(keyword[0]).color).toBe('#c678dd');
  });

  it('keeps unknown code languages as plain text', () => {
    expect(textOf(render('```notalanguage\nplain\n```'))).toBe('plain\n');
  });

  it('bolds the first table row as the header', () => {
    const output = render('| A | B |\n| - | - |\n| 1 | 2 |');

    const bold = findElements(output, (el) => flatStyle(el).fontWeight === 700);
    expect(bold.map(textOf)).toEqual(['A', 'B']);
  });

  it('skips images react-pdf cannot embed', () => {
    const images = (markdown: string) => findElements(render(markdown), (el) => el.type === Image);

    expect(images('![svg](https://example.com/logo.svg)')).toHaveLength(0);
    expect(images('![gif](data:image/gif;base64,AAAA)')).toHaveLength(0);
    expect(images('![png](data:image/png;base64,AAAA)')).toHaveLength(1);
  });

  it('applies inline colour styles from raw HTML', () => {
    const output = render('<span style="color: #ff0000">red</span>');

    const red = findElements(output, (el) => flatStyle(el).color === '#ff0000');
    expect(red.map(textOf)).toEqual(['red']);
  });

  it('gives every element in a list a key', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const output = render('# Title\n\n- a\n- b\n\n| A |\n| - |\n| 1 |\n\n```js\nlet a = 1;\n```');

    // React reports missing keys while reconciling, so mount the output in react-pdf's renderer
    pdf(
      <Document>
        <Page>{output}</Page>
      </Document>,
    );

    expect(consoleError).not.toHaveBeenCalled();
  });
});
