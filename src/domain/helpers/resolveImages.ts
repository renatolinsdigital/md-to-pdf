import type { Root, RootContent, Element, ElementContent } from 'hast';

/**
 * Convert a Blob to a base64 data-URL string.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetch a remote image, convert to JPEG or PNG, and return a data-URL.
 *
 * @react-pdf/image's `resolveBase64Image` reliably handles data-URLs
 * in the form `data:image/(jpeg|png);base64,...`.
 */
async function fetchImageAsDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${src}`);
  }
  const blob = await response.blob();

  // JPEG / PNG — convert raw bytes to a data-URL
  if (blob.type === 'image/jpeg' || blob.type === 'image/png') {
    return blobToDataUrl(blob);
  }

  // Anything else (WebP, AVIF, …) — re-encode as JPEG via canvas
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  // canvas.toDataURL always returns `data:image/jpeg;base64,...`
  return canvas.toDataURL('image/jpeg', 0.85);
}

/** Validate that a data-URL has a format @react-pdf can decode. */
function isUsableDataUrl(url: string): boolean {
  return /^data:image\/(jpeg|png);base64,/.test(url);
}

function isElement(node: RootContent | ElementContent): node is Element {
  return node.type === 'element';
}

async function resolveNode(node: RootContent | ElementContent): Promise<void> {
  if (!isElement(node)) return;

  if (node.tagName === 'img' && typeof node.properties?.src === 'string') {
    const src = node.properties.src;

    // Strip SVG data-URLs — @react-pdf can't decode them
    if (src.startsWith('data:image/svg')) {
      node.properties.src = '';
    } else if (/^https?:\/\//.test(src)) {
      try {
        const dataUrl = await fetchImageAsDataUrl(src);
        if (isUsableDataUrl(dataUrl)) {
          node.properties.src = dataUrl;
        } else {
          node.properties.src = '';
        }
      } catch {
        node.properties.src = '';
      }
    }
  }

  for (const child of node.children) {
    await resolveNode(child);
  }
}

/**
 * Walk a HAST tree and resolve all remote images to data-URL strings
 * so @react-pdf/renderer can embed them without CORS or format issues.
 * Mutates the tree in-place and returns it.
 */
export async function resolveImages(tree: Root): Promise<Root> {
  for (const child of tree.children) {
    await resolveNode(child);
  }
  return tree;
}
