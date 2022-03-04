import { LeafNode, ParentNode } from './types';

export function isLeafNode(node: LeafNode | ParentNode): node is LeafNode {
  return (node as ParentNode).children === undefined;
}

export function isParentNode(node: LeafNode | ParentNode): node is ParentNode {
  return (node as ParentNode).children !== undefined;
}
