import { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { PdfDocument } from '@domain/components/PdfDocument/PdfDocument';
import { resolveImages } from '@domain/helpers/resolveImages';
import { stripImages } from '@domain/helpers/stripImages';
import { rasterizePattern } from '@domain/helpers/backgroundPatterns';

const DEBOUNCE_MS = 300;

/**
 * Generates a live PDF blob from the current HAST tree + settings.
 * Debounces regeneration so rapid edits don't queue many renders.
 *
 * If PDF generation fails (e.g. an image the renderer can't decode),
 * it automatically retries once with all images stripped from the tree.
 */
export function useLivePdf(hastTree: Root | null, settings: ConverterSettings) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const genRef = useRef(0);

  useEffect(() => {
    const gen = ++genRef.current;

    if (!hastTree) {
      setPdfBlob(null);
      setIsRendering(false);
      return;
    }

    const generate = async (tree: Root): Promise<Blob> => {
      const [resolvedTree, patternDataUrl] = await Promise.all([
        resolveImages(structuredClone(tree)),
        rasterizePattern(
          settings.backgroundPattern.patternId,
          settings.backgroundPattern.patternColor,
          settings.backgroundPattern.opacity,
          settings.pageSize,
          settings.backgroundPattern.elementSize,
          settings.backgroundPattern.gap,
        ),
      ]);
      const doc = PdfDocument({ hastTree: resolvedTree, settings, patternDataUrl });
      return pdf(doc).toBlob();
    };

    const run = async () => {
      if (gen !== genRef.current) return;
      setIsRendering(true);

      try {
        const blob = await generate(hastTree);
        if (gen !== genRef.current) return;
        setPdfBlob(blob);
      } catch (err) {
        console.warn('[useLivePdf] PDF generation failed, retrying without images:', err);
        if (gen !== genRef.current) return;

        // Retry without images - a broken image should never prevent the PDF from rendering
        try {
          const blob = await generate(stripImages(hastTree));
          if (gen !== genRef.current) return;
          setPdfBlob(blob);
        } catch (retryErr) {
          console.error('[useLivePdf] PDF generation failed even without images:', retryErr);
        }
      } finally {
        if (gen === genRef.current) {
          setIsRendering(false);
        }
      }
    };

    const timer = setTimeout(run, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [hastTree, settings]);

  return { pdfBlob, isRendering };
}
