import { LeafNode, ParentNode } from './types';

export function isLeafNode(node: LeafNode | ParentNode): node is LeafNode {
  return (node as ParentNode).children === undefined;
}

export function isParentNode(node: LeafNode | ParentNode): node is ParentNode {
  return (node as ParentNode).children !== undefined;
}

export function findNodeWithId(
  root: LeafNode | ParentNode,
  id: string
): LeafNode | ParentNode | undefined {
  // Terminating condition
  if (root.id === id) return root;

  if (isParentNode(root)) {
    return root.children.find((child) => {
      const found = findNodeWithId(child, id);
      if (found) return found;
    });
  }
}
