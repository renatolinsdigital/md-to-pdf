import { useState, useEffect, useRef, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { PdfDocument } from '@domain/components/PdfDocument/PdfDocument';
import { resolveImages } from '@domain/helpers/resolveImages';

const DEBOUNCE_MS = 300;

/**
 * Generates a live PDF blob URL from the current markdown HAST tree + settings.
 * Regeneration is debounced — it fires only after `DEBOUNCE_MS` of no changes.
 */
export function useLivePdf(hastTree: Root | null, settings: ConverterSettings) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const prevUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0); // track latest generation to discard stale results

  const generate = useCallback(async (tree: Root | null, s: ConverterSettings, gen: number) => {
    if (!tree) {
      // No content — clear the viewer
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      setPdfUrl(null);
      setIsRendering(false);
      return;
    }

    setIsRendering(true);
    try {
      const resolvedTree = await resolveImages(structuredClone(tree));

      // Discard if a newer generation was queued while we were working
      if (gen !== generationRef.current) return;

      const doc = PdfDocument({ hastTree: resolvedTree, settings: s });
      const blob = await pdf(doc).toBlob();

      if (gen !== generationRef.current) return;

      const url = URL.createObjectURL(blob);

      // Revoke old URL
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
      prevUrlRef.current = url;
      setPdfUrl(url);
    } catch (err) {
      console.error('[useLivePdf] generation failed', err);
    } finally {
      if (gen === generationRef.current) {
        setIsRendering(false);
      }
    }
  }, []);

  useEffect(() => {
    // Bump generation counter and schedule debounced generation
    const gen = ++generationRef.current;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      generate(hastTree, settings, gen);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hastTree, settings, generate]);

  // Generate immediately on first mount (no debounce for initial render)
  const initialRef = useRef(true);
  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      const gen = ++generationRef.current;
      generate(hastTree, settings, gen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  return { pdfUrl, isRendering };
}
