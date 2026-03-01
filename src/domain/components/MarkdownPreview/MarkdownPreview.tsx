import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import styles from './MarkdownPreview.module.scss';

// PDF page sizes in points (1 pt = 1/72 in).
// We render pages at these exact px sizes then CSS-scale them to fit.
const PAGE_PT: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
  LEGAL: [612, 1008],
};

const MM_TO_PT = 2.835;

interface MarkdownPreviewProps {
  markdown: string;
  settings: ConverterSettings;
}

export function MarkdownPreview({ markdown, settings }: MarkdownPreviewProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Array<{ offsetY: number; clipHeight: number }>>([]);
  const [displayScale, setDisplayScale] = useState(1);

  // ── Page geometry in "real" pt-pixels (1 pt = 1 CSS px before scaling) ──
  const geo = useMemo(() => {
    const dims: [number, number] = (PAGE_PT[settings.pageSize] ?? PAGE_PT.A4) as [number, number];
    const pageWidth = dims[0];
    const pageHeight = dims[1];

    const mt = settings.margins.top * MM_TO_PT;
    const mr = settings.margins.right * MM_TO_PT;
    const mb = settings.margins.bottom * MM_TO_PT;
    const ml = settings.margins.left * MM_TO_PT;
    const footer = settings.pageNumber.enabled ? 30 : 0;

    const contentHeight = pageHeight - mt - mb - footer;
    const contentWidth = pageWidth - ml - mr;

    return { pageWidth, pageHeight, mt, mr, mb, ml, footer, contentHeight, contentWidth };
  }, [settings.pageSize, settings.margins, settings.pageNumber.enabled]);

  // ── Measure content and compute page breaks that never split block elements ──
  const recalcPages = useCallback(() => {
    const el = measureRef.current;
    if (!el || geo.contentHeight <= 0) return;
    const totalHeight = el.scrollHeight;
    if (totalHeight <= 0) {
      setPages([{ offsetY: 0, clipHeight: geo.contentHeight }]);
      return;
    }

    // Collect bottom-edges of all block-level descendants as safe break points.
    // Walking recursively lets us break *between* rows in a table, items in a
    // list, etc., instead of pushing the whole parent block to the next page.
    const BLOCK_TAGS = new Set([
      'P',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'LI',
      'TR',
      'PRE',
      'BLOCKQUOTE',
      'DIV',
      'HR',
      'TABLE',
      'UL',
      'OL',
      'IMG',
      'FIGURE',
    ]);
    const containerTop = el.getBoundingClientRect().top;
    const breakSet = new Set<number>();

    const walk = (node: Element) => {
      for (const child of Array.from(node.children)) {
        if (child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName)) {
          breakSet.add(Math.round(child.getBoundingClientRect().bottom - containerTop));
          if (child.children.length > 0) walk(child);
        }
      }
    };
    walk(el);

    const breakPoints = [...breakSet].sort((a, b) => a - b);

    const result: Array<{ offsetY: number; clipHeight: number }> = [];
    let currentOffset = 0;

    while (currentOffset < totalHeight) {
      const pageBottom = currentOffset + geo.contentHeight;

      // Last page – show whatever remains
      if (pageBottom >= totalHeight - 1) {
        result.push({ offsetY: currentOffset, clipHeight: totalHeight - currentOffset });
        break;
      }

      // Find the last break point that fits within this page (binary-search style
      // scan from the end).  This maximises content per page, matching PDF behaviour.
      let bestBreak = -1;
      for (let i = breakPoints.length - 1; i >= 0; i--) {
        const bp = breakPoints[i]!;
        if (bp <= pageBottom + 1 && bp > currentOffset + 1) {
          bestBreak = bp;
          break;
        }
      }

      if (bestBreak <= currentOffset) {
        // No safe break found – fall back to geometric cut (element taller than page)
        bestBreak = pageBottom;
      }

      result.push({ offsetY: currentOffset, clipHeight: bestBreak - currentOffset });
      currentOffset = bestBreak;
    }

    if (result.length === 0) {
      result.push({ offsetY: 0, clipHeight: geo.contentHeight });
    }
    setPages(result);
  }, [geo.contentHeight]);

  useEffect(() => {
    const id = setTimeout(recalcPages, 50);
    return () => clearTimeout(id);
  }, [markdown, settings, recalcPages]);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recalcPages);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcPages]);

  // ── Compute display scale: fit page width into available container width ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateScale = () => {
      // Leave 24px of padding on each side
      const available = container.clientWidth - 48;
      const s = available > 0 ? Math.min(1, available / geo.pageWidth) : 0.5;
      setDisplayScale(s);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(container);
    return () => ro.disconnect();
  }, [geo.pageWidth]);

  const imgAlignClass =
    settings.imageAlignment === 'center'
      ? styles.imgCenter
      : settings.imageAlignment === 'right'
        ? styles.imgRight
        : styles.imgLeft;

  const markdownElement = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          if (match) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                  overflow: 'visible',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '10px',
                    lineHeight: '1.5',
                  },
                }}
              >
                {codeString}
              </SyntaxHighlighter>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );

  const scaledPageW = geo.pageWidth * displayScale;
  const scaledPageH = geo.pageHeight * displayScale;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewLabel}>Preview</div>

      {/* Hidden measurer at real pt-px dimensions */}
      <div
        ref={measureRef}
        className={`${styles.measurer} ${styles.markdownContent} ${imgAlignClass}`}
        style={{ width: geo.contentWidth, color: settings.textColor }}
        aria-hidden="true"
      >
        {markdownElement}
      </div>

      {/* Scrollable page list */}
      <div ref={containerRef} className={styles.pagesScroller}>
        {(pages.length > 0 ? pages : [{ offsetY: 0, clipHeight: geo.contentHeight }]).map(
          (pageInfo, i) => (
            <div
              key={i}
              className={styles.pageWrapper}
              style={{ width: scaledPageW, height: scaledPageH }}
            >
              <div
                className={styles.page}
                style={{
                  width: geo.pageWidth,
                  height: geo.pageHeight,
                  backgroundColor: settings.backgroundColor,
                  transform: `scale(${displayScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  className={styles.pageClip}
                  style={{
                    top: geo.mt,
                    left: geo.ml,
                    width: geo.contentWidth,
                    height: pageInfo.clipHeight,
                  }}
                >
                  <div
                    className={`${styles.markdownContent} ${imgAlignClass}`}
                    style={{
                      width: geo.contentWidth,
                      color: settings.textColor,
                      transform: `translateY(${-pageInfo.offsetY}px)`,
                    }}
                  >
                    {markdownElement}
                  </div>
                </div>

                {settings.pageNumber.enabled && (
                  <div
                    className={styles.pageNumber}
                    style={{
                      fontSize: settings.pageNumber.fontSize,
                      bottom: geo.mb / 2 + 4,
                    }}
                  >
                    {settings.pageNumber.pageLabel} {i + 1} {settings.pageNumber.ofLabel}{' '}
                    {pages.length || 1}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
