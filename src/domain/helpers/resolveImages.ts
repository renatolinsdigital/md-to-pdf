import type { Root, RootContent, Element, ElementContent } from 'hast';

async function urlToDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function isElement(node: RootContent | ElementContent): node is Element {
  return node.type === 'element';
}

async function resolveNode(node: RootContent | ElementContent): Promise<void> {
  if (!isElement(node)) return;

  if (
    node.tagName === 'img' &&
    typeof node.properties?.src === 'string' &&
    /^https?:\/\//.test(node.properties.src)
  ) {
    try {
      node.properties.src = await urlToDataUrl(node.properties.src);
    } catch {
      // leave original src; PDF generation may still partially succeed
    }
  }

  for (const child of node.children) {
    await resolveNode(child);
  }
}

/**
 * Walk a HAST tree and replace all remote image `src` attributes with
 * inline base64 data URLs so @react-pdf/renderer can embed them without CORS issues.
 * Mutates the tree in-place and returns it.
 */
export async function resolveImages(tree: Root): Promise<Root> {
  for (const child of tree.children) {
    await resolveNode(child);
  }
  return tree;
}
