import { useMemo } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'hast';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);

export function useMarkdownParser(markdown: string): Root | null {
  return useMemo(() => {
    if (!markdown.trim()) return null;

    try {
      const mdast = processor.parse(markdown);
      return processor.runSync(mdast) as Root;
    } catch {
      return null;
    }
  }, [markdown]);
}
