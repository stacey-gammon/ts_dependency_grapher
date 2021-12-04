import { LeafNode, ParentNode } from '../types/types';
import { isLeafNode } from '../zoom/zoom_out';

export function getLeafNodes(root: ParentNode | LeafNode): Array<LeafNode> {
  const leafNodes: LeafNode[] = [];
  getLeafNodeInner(root, leafNodes);
  return leafNodes;
}

function getLeafNodeInner(node: ParentNode | LeafNode, leafNodes: Array<LeafNode>) {
  if (isLeafNode(node)) {
    leafNodes.push(node);
  } else {
    node.children.forEach((child) => getLeafNodeInner(child, leafNodes));
  }
}
