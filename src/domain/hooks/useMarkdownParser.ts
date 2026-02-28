import { useMemo } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'hast';

export function useMarkdownParser(markdown: string): Root | null {
  const hastTree = useMemo(() => {
    if (!markdown.trim()) return null;

    try {
      const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

      const hast = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .runSync(mdast) as Root;

      return hast;
    } catch {
      return null;
    }
  }, [markdown]);

  return hastTree;
}
