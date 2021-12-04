import { LeafNode, ParentNode } from '../types/types';
import { NodeStats } from '../types/node_stats';
import { isLeafNode } from '../zoom/zoom_out';
import { DependencyStatsMapping } from './get_dependency_stats';
import { OrgScoreStatsMapping } from './fill_org_score_stats';

export function fillNodeStats(
  node: ParentNode | LeafNode,
  nodeStats: { [key: string]: NodeStats },
  orgStats: OrgScoreStatsMapping,
  dependencyStats: DependencyStatsMapping
) {
  if (isLeafNode(node)) {
    nodeStats[node.id] = {
      ...node,
      ...orgStats[node.id],
      ...dependencyStats[node.id],
    };
  } else {
    node.children.forEach((child) => fillNodeStats(child, nodeStats, orgStats, dependencyStats));
  }
}
