import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { useToast } from './useToast';
import { PdfDocument } from '@domain/components/PdfDocument/PdfDocument';
import { resolveImages } from '@domain/helpers/resolveImages';

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

      try {
        // Clone so the live preview HAST is never mutated, then resolve
        // remote image URLs to base64 data URLs (avoids CORS in @react-pdf).
        const resolvedTree = await resolveImages(structuredClone(hastTree));
        const doc = PdfDocument({ hastTree: resolvedTree, settings });
        const blob = await pdf(doc).toBlob();
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
