import { LeafNode, ParentNode } from '../types/types';

export function moveNode(node: LeafNode | ParentNode, parentNode: ParentNode) {
  if (node.parentNode) {
    const indexOfChild = node.parentNode?.children.findIndex((child) => child.id === node.id);
    node.parentNode?.children.splice(indexOfChild, 1);
    node.parentNode = parentNode;
  }
  parentNode.children.push(node);
}
