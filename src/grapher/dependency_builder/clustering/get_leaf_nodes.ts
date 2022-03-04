import { LeafNode, ParentNode } from '../types';
import { isParentNode } from '../utils';

export function getLeafNodes(root: ParentNode | LeafNode): Array<LeafNode> {
  const leafNodes: LeafNode[] = [];
  getLeafNodeInner(root, leafNodes);
  return leafNodes;
}

function getLeafNodeInner(node: ParentNode | LeafNode, leafNodes: Array<LeafNode>) {
  if (isParentNode(node)) {
    node.children.forEach((child) => getLeafNodeInner(child, leafNodes));
  } else {
    leafNodes.push(node);
  }
}
