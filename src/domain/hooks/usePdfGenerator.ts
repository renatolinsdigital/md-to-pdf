import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { useToast } from './useToast';
import { PdfDocument } from '@domain/components/PdfDocument/PdfDocument';
import { resolveImages } from '@domain/helpers/resolveImages';

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

export function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const generatePdf = useCallback(
    async (hastTree: Root | null, settings: ConverterSettings) => {
      if (!hastTree) {
        showToast('Please enter some markdown text first', 'warning');
        return;
      }

      setIsGenerating(true);

      const generate = async (tree: Root): Promise<Blob> => {
        const resolvedTree = await resolveImages(structuredClone(tree));
        const doc = PdfDocument({ hastTree: resolvedTree, settings });
        return pdf(doc).toBlob();
      };

      try {
        let blob: Blob;
        try {
          blob = await generate(hastTree);
        } catch (err) {
          console.warn('[usePdfGenerator] Retrying without images:', err);
          blob = await generate(stripImages(hastTree));
        }

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        showToast('PDF generated successfully!', 'success');
      } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Failed to generate PDF. Please try again.', 'error');
      } finally {
        setIsGenerating(false);
      }
    },
    [showToast],
  );

  return { generatePdf, isGenerating };
}
