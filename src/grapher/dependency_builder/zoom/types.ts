import { LeafNode, ParentNode } from '../types';

export interface NodeWithNonLeafChildren {
  id: string;
  children: ParentNode[];
}

export interface NodeWithLeafChildren {
  id: string;
  children: LeafNode[];
}
