import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'hast';

// Raw HTML is allowed through so users can style text (colour spans, aligned divs, captions)
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);

/** Parses Markdown (GFM + inline HTML) into a HAST tree, or null when there is nothing to render. */
export function parseMarkdown(markdown: string): Root | null {
  if (!markdown.trim()) return null;

  try {
    return processor.runSync(processor.parse(markdown)) as Root;
  } catch (err) {
    console.error('[parseMarkdown] Failed to parse markdown:', err);
    return null;
  }
}
