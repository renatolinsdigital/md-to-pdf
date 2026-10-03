import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './PdfCanvasViewer.module.scss';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/** Pages are rasterised at twice the container width so they stay crisp on high-DPI screens. */
const PIXEL_DENSITY = 2;
const FALLBACK_WIDTH = 600;

interface PdfCanvasViewerProps {
  blob: Blob | null;
  isRendering: boolean;
}

interface RenderedPdf {
  blob: Blob;
  /** One JPEG data-URL per page. */
  pages: string[];
}

/** Rasterises every page of the PDF, or resolves to null if cancelled midway. */
async function renderPages(
  blob: Blob,
  targetWidth: number,
  isCancelled: () => boolean,
): Promise<string[] | null> {
  const data = new Uint8Array(await blob.arrayBuffer());
  if (isCancelled()) return null;

  const doc = await pdfjsLib.getDocument({ data }).promise;
  try {
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      if (isCancelled()) return null;

      const page = await doc.getPage(i);
      const scale = targetWidth / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const canvasContext = canvas.getContext('2d');
      if (!canvasContext) throw new Error('Canvas 2D context is unavailable');

      await page.render({ canvasContext, viewport, canvas }).promise;
      pages.push(canvas.toDataURL('image/jpeg', 0.92));
    }
    return isCancelled() ? null : pages;
  } finally {
    doc.destroy();
  }
}

export function PdfCanvasViewer({ blob, isRendering }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState<RenderedPdf | null>(null);

  // Forget the old pages as soon as the document is cleared, so they don't
  // reappear under the spinner when the next document starts rendering.
  if (!blob && rendered) setRendered(null);

  useEffect(() => {
    if (!blob) return;

    let cancelled = false;
    const container = containerRef.current;
    const scrollTop = container?.scrollTop ?? 0;
    const targetWidth = (container?.clientWidth ?? FALLBACK_WIDTH) * PIXEL_DENSITY;

    renderPages(blob, targetWidth, () => cancelled)
      .then((pages) => {
        if (!pages) return;
        setRendered({ blob, pages });

        // Keep the reader's place, clamped in case the document got shorter
        requestAnimationFrame(() => {
          const c = containerRef.current;
          if (c) c.scrollTop = Math.min(scrollTop, Math.max(c.scrollHeight - c.clientHeight, 0));
        });
      })
      .catch((err) => console.error('[PdfCanvasViewer] render error:', err));

    return () => {
      cancelled = true;
    };
  }, [blob]);

  const pages = rendered?.pages ?? [];
  const hasContent = pages.length > 0;
  const showLoading = isRendering || (blob !== null && rendered?.blob !== blob);

  return (
    <div ref={containerRef} className={styles.container}>
      {showLoading && hasContent && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}

      {pages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Page ${i + 1}`}
          className={styles.pageImage}
          draggable={false}
        />
      ))}

      {!hasContent && (
        <div className={styles.placeholder}>
          {showLoading ? 'Generating PDF…' : 'Start typing to see a live PDF preview'}
        </div>
      )}
    </div>
  );
}
