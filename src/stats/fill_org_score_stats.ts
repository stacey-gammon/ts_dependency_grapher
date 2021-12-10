import { LeafNode, ParentNode } from '../types/types';
import { isLeafNode } from '../zoom/zoom_out';
import { GVEdgeMapping } from '../types/edge_types';
import { getOrgScoreForNode } from './get_org_score_for_node';

export interface CoupledConnection {
  parentNode: ParentNode;
  connectionWeight: number;
}

export interface OrgScoreStats {
  connections: string;
  tightestConnectionParentId: string;
  tightestConnectionWeight: number;
  orgScore: number;
  intraDependencyCount: number;
  interDependencyCount: number;
}

export interface OrgScoreStatsMapping {
  [key: string]: OrgScoreStats;
}

export function fillOrgScoreStats(
  edges: GVEdgeMapping,
  node: LeafNode | ParentNode,
  stats: OrgScoreStatsMapping
) {
  if (isLeafNode(node)) {
    stats[node.id] = getOrgScoreForNode(node, edges);
  } else {
    node.children.forEach((child) => {
      fillOrgScoreStats(edges, child, stats);
    });
  }
}
