import { LeafNode, NodeStats, ParentNode } from '../types';

export interface AllNodeStats {
  stats: { [key: string]: NodeStats };
  maxes: NodeStats;
  mins: NodeStats;
  recommendations: RecommendationsList;
}

export interface RecommendationsByParent {
  [key: string]: Array<Recommendation>;
}

export interface Recommendation {
  node: LeafNode;
  newParent: ParentNode;
  //originalParent: ParentNode;
}

export type RecommendationsList = Array<{ node: LeafNode; newParent: ParentNode }>;
