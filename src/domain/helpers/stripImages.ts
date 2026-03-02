import type { Root } from 'hast';

/**
 * Remove all `<img>` elements from a HAST tree.
 * Returns a shallow clone - the original tree is not mutated.
 */
export function stripImages(tree: Root): Root {
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
