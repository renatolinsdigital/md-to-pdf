import { useState, useEffect } from 'react';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { renderPdf } from '@domain/services/renderPdf';

const DEBOUNCE_MS = 300;

/**
 * Keeps a PDF blob of the current document up to date, debounced so rapid
 * edits don't queue up renders. Results of superseded renders are discarded.
 */
export function useLivePdf(hastTree: Root | null, settings: ConverterSettings) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!hastTree) {
      setPdfBlob(null);
      setIsRendering(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsRendering(true);
      try {
        const blob = await renderPdf(hastTree, settings);
        if (!cancelled) setPdfBlob(blob);
      } catch (err) {
        console.error('[useLivePdf] PDF generation failed even without images:', err);
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hastTree, settings]);

  return { pdfBlob, isRendering };
}
