import { LeafNode, ParentNode } from '../types/types';
import { isLeafNode } from '../zoom/zoom_out';

export function getNodeById(
  id: string,
  node: ParentNode | LeafNode
): ParentNode | LeafNode | undefined {
  if (node.id === id) {
    return node;
  }

  if (!isLeafNode(node)) {
    for (const child of node.children) {
      const found = getNodeById(id, child);
      if (found) return found;
    }
  }
  return undefined;
}
