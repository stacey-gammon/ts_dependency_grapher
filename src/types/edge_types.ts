import { LeafNode } from './types';

export interface GVEdgeMapping {
  [key: string]: NodeEdges;
}

export interface NodeEdges {
  node: LeafNode;

  // Edges have different weighs associated them based on how many imports are between them.
  outgoing: Array<Edge>;
  incoming: Array<Edge>;
}

export interface Edge {
  node: LeafNode;
  dependencyWeight: number;
}
