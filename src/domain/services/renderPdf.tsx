import { pdf } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import { PdfDocument } from '@domain/components/PdfDocument/PdfDocument';
import { rasterizePattern } from '@domain/helpers/backgroundPatterns';
import { resolveImages } from '@domain/helpers/resolveImages';
import { stripImages } from '@domain/helpers/stripImages';

async function renderOnce(hastTree: Root, settings: ConverterSettings): Promise<Blob> {
  const [resolvedTree, patternDataUrl] = await Promise.all([
    // Cloned because resolving images mutates the tree, which the caller still owns
    resolveImages(structuredClone(hastTree)),
    rasterizePattern(settings.backgroundPattern, settings.pageSize),
  ]);
  return pdf(
    <PdfDocument hastTree={resolvedTree} settings={settings} patternDataUrl={patternDataUrl} />,
  ).toBlob();
}

/**
 * Renders the document to a PDF blob. One image the renderer can't decode
 * shouldn't cost the user the whole PDF, so a failed render is retried once
 * with every image left out.
 */
export async function renderPdf(hastTree: Root, settings: ConverterSettings): Promise<Blob> {
  try {
    return await renderOnce(hastTree, settings);
  } catch (err) {
    console.warn('[renderPdf] Rendering failed, retrying without images:', err);
    return renderOnce(stripImages(hastTree), settings);
  }
}
