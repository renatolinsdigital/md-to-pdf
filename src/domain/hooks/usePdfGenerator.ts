import { useState, useCallback } from 'react';
import type { Root } from 'hast';
import type { ConverterSettings } from './useConverterSettings';
import { useToast } from '@shared/hooks/useToast';
import { downloadBlob } from '@shared/helpers/downloadBlob';
import { renderPdf } from '@domain/services/renderPdf';

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
        downloadBlob(await renderPdf(hastTree, settings), 'document.pdf');
        showToast('PDF generated successfully!', 'success');
      } catch (error) {
        console.error('[usePdfGenerator] PDF generation failed:', error);
        showToast('Failed to generate PDF. Please try again.', 'error');
      } finally {
        setIsGenerating(false);
      }
    },
    [showToast],
  );

  return { generatePdf, isGenerating };
}
