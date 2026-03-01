import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './PdfCanvasViewer.module.scss';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfCanvasViewerProps {
  blob: Blob | null;
  isRendering: boolean;
}

export function PdfCanvasViewer({ blob, isRendering }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const scrollTopRef = useRef(0);
  const genRef = useRef(0);

  useEffect(() => {
    const gen = ++genRef.current;

    if (!blob) {
      const id = requestAnimationFrame(() => {
        if (gen === genRef.current) {
          setRenderedBlob(null);
          setPages([]);
        }
      });
      return () => cancelAnimationFrame(id);
    }

    // Save current scroll position
    if (containerRef.current) {
      scrollTopRef.current = containerRef.current.scrollTop;
    }

    const render = async () => {
      const data = new Uint8Array(await blob.arrayBuffer());
      if (gen !== genRef.current) return;

      const doc = await pdfjsLib.getDocument({ data }).promise;
      if (gen !== genRef.current) {
        doc.destroy();
        return;
      }

      // Use container width for scale (2x for crisp rendering on high-DPI)
      const containerWidth = containerRef.current?.clientWidth ?? 600;
      const images: string[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        if (gen !== genRef.current) {
          doc.destroy();
          return;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth * 2) / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        if (gen !== genRef.current) {
          doc.destroy();
          return;
        }

        images.push(canvas.toDataURL('image/jpeg', 0.92));
      }

      if (gen !== genRef.current) {
        doc.destroy();
        return;
      }

      setRenderedBlob(blob);
      setPages(images);
      doc.destroy();

      // Restore scroll — clamped to new max if PDF got shorter
      requestAnimationFrame(() => {
        const c = containerRef.current;
        if (c) {
          const max = c.scrollHeight - c.clientHeight;
          c.scrollTop = max > 0 ? Math.min(scrollTopRef.current, max) : 0;
        }
      });
    };

    render().catch((err) => {
      console.error('[PdfCanvasViewer] render error:', err);
    });
  }, [blob]);

  // Derive loading state: true when a blob exists but hasn't finished rendering yet
  const internalRendering = blob !== null && renderedBlob !== blob;
  const showLoading = isRendering || internalRendering;
  const hasContent = pages.length > 0;

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
