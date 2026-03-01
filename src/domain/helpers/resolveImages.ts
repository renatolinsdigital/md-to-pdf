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

/** Collect all `<img>` element nodes from a subtree. */
function collectImageNodes(node: RootContent | ElementContent, out: Element[]): void {
  if (!isElement(node)) return;
  if (node.tagName === 'img') out.push(node);
  for (const child of node.children) {
    collectImageNodes(child, out);
  }
}

async function resolveNode(node: Element): Promise<void> {
  if (typeof node.properties?.src !== 'string') return;
  const src = node.properties.src;

  if (src.startsWith('data:image/svg')) {
    node.properties.src = '';
  } else if (/^https?:\/\//.test(src)) {
    try {
      const dataUrl = await fetchImageAsDataUrl(src);
      node.properties.src = isUsableDataUrl(dataUrl) ? dataUrl : '';
    } catch {
      node.properties.src = '';
    }
  }
}

/**
 * Walk a HAST tree and resolve all remote images to data-URL strings
 * so @react-pdf/renderer can embed them without CORS or format issues.
 * Fetches are parallelized for performance. Mutates the tree in-place.
 */
export async function resolveImages(tree: Root): Promise<Root> {
  const images: Element[] = [];
  for (const child of tree.children) {
    if (isElement(child)) collectImageNodes(child, images);
  }
  await Promise.all(images.map(resolveNode));
  return tree;
}
