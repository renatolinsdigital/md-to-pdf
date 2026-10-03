import { useMemo } from 'react';
import type { Root } from 'hast';
import { parseMarkdown } from '@domain/helpers/parseMarkdown';

export function useMarkdownParser(markdown: string): Root | null {
  return useMemo(() => parseMarkdown(markdown), [markdown]);
}
