import { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { PdfDocument } from '@domain/components/PdfDocument/PdfDocument';
import { resolveImages } from '@domain/helpers/resolveImages';

const DEBOUNCE_MS = 300;

/** Remove all <img> elements from a HAST tree (returns a shallow clone). */
function stripImages(tree: Root): Root {
  function filterChildren(children: Root['children']): Root['children'] {
    return children
      .filter((node) => !(node.type === 'element' && node.tagName === 'img'))
      .map((node) => {
        if (node.type === 'element' && 'children' in node) {
          return {
            ...node,
            children: filterChildren(node.children as Root['children']),
          } as typeof node;
        }
        return node;
      });
  }
  return { ...tree, children: filterChildren(tree.children) };
}

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
      const resolvedTree = await resolveImages(structuredClone(tree));
      const doc = PdfDocument({ hastTree: resolvedTree, settings });
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

        // Retry without images — a broken image should never prevent the PDF from rendering
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
