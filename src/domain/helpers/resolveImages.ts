import type { Element, Root, RootContent } from 'hast';

/** The only data-URL formats @react-pdf/renderer decodes reliably. */
export function isEmbeddableDataUrl(url: string): boolean {
  return /^data:image\/(jpeg|png);base64,/.test(url);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

/** Fetches an image as a JPEG/PNG data-URL, re-encoding other formats (WebP, AVIF, ...) as JPEG. */
async function fetchImageAsDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${src}`);
  }
  const blob = await response.blob();

  if (blob.type === 'image/jpeg' || blob.type === 'image/png') {
    return blobToDataUrl(blob);
  }

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable');
  ctx.fillStyle = '#ffffff'; // JPEG has no alpha channel
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Recently loaded images. The live preview re-renders on every pause in typing,
 * and without this each render would refetch and re-encode every image.
 */
const imageCache = new Map<string, Promise<string>>();
const IMAGE_CACHE_LIMIT = 50;

function loadImage(src: string): Promise<string> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const pending = fetchImageAsDataUrl(src);
  imageCache.set(src, pending);
  // Forget failures so the image is retried on the next render
  pending.catch(() => imageCache.delete(src));

  if (imageCache.size > IMAGE_CACHE_LIMIT) {
    const oldest = imageCache.keys().next().value;
    if (oldest !== undefined) imageCache.delete(oldest);
  }
  return pending;
}

function collectImages(nodes: RootContent[]): Element[] {
  return nodes.flatMap((node) => {
    if (node.type !== 'element') return [];
    const nested = collectImages(node.children);
    return node.tagName === 'img' ? [node, ...nested] : nested;
  });
}

async function resolveImage(img: Element): Promise<void> {
  const { src } = img.properties;
  if (typeof src !== 'string' || !/^https?:\/\//.test(src)) return;

  try {
    const dataUrl = await loadImage(src);
    img.properties.src = isEmbeddableDataUrl(dataUrl) ? dataUrl : '';
  } catch {
    // Broken links are expected in user content: the image is left out of the PDF
    img.properties.src = '';
  }
}

/**
 * Replaces remote image URLs with data-URLs so @react-pdf/renderer can embed
 * them without CORS or format issues. Mutates the tree in place.
 */
export async function resolveImages(tree: Root): Promise<Root> {
  await Promise.all(collectImages(tree.children).map(resolveImage));
  return tree;
}
