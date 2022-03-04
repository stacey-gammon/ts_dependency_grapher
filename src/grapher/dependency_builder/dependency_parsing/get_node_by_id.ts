import { LeafNode, ParentNode } from '../types';
import { isParentNode } from '../utils';

export function getNodeById(
  id: string,
  node: ParentNode | LeafNode
): ParentNode | LeafNode | undefined {
  if (node.id === id) {
    return node;
  }

  if (isParentNode(node)) {
    for (const child of node.children) {
      const found = getNodeById(id, child);
      if (found) return found;
    }
  }
  return undefined;
}
