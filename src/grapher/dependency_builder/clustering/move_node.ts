import { LeafNode, ParentNode } from '../types';
import { findNodeWithId, isParentNode } from '../utils';

export function moveNode(
  node: LeafNode | ParentNode,
  targetParentNode: ParentNode,
  root: LeafNode | ParentNode
) {
  if (node.parentId) {
    const currentParentNode = findNodeWithId(root, node.parentId);

    if (!currentParentNode) {
      throw new Error(`Node not found in tree with id ${node.parentId}`);
    }

    if (isParentNode(currentParentNode)) {
      const indexOfChild = currentParentNode?.children.findIndex((child) => child.id === node.id);
      currentParentNode?.children.splice(indexOfChild, 1);
      node.parentId = targetParentNode.id;
    }
  }
  targetParentNode.children.push(node);
}
