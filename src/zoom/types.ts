import { BaseNode, LeafNode, ParentNode } from '../types';

export interface NodeWithNonLeafChildren extends BaseNode {
  children: ParentNode[];
}

export interface NodeWithLeafChildren extends BaseNode {
  children: LeafNode[];
}
