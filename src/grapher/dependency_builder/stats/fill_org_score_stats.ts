import { LeafNode, ParentNode, GVEdgeMapping, ApiItemMap } from '../types';
import { isParentNode } from '../utils';
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
  node: LeafNode | ParentNode,
  items: ApiItemMap,
  edges: GVEdgeMapping,
  stats: OrgScoreStatsMapping
) {
  if (!isParentNode(node)) {
    stats[node.id] = getOrgScoreForNode(node, items, edges);
  } else {
    node.children.forEach((child) => {
      fillOrgScoreStats(child, items, edges, stats);
    });
  }
}
