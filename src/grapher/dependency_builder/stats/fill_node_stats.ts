import { ApiItemMap, LeafNode, ParentNode } from '../types';
import { NodeStats } from '../types/node_stats';
import { isParentNode } from '../utils';
import { DependencyStatsMapping } from './get_dependency_stats';
import { OrgScoreStatsMapping } from './fill_org_score_stats';

export function fillNodeStats(
  node: ParentNode | LeafNode,
  items: ApiItemMap,
  nodeStats: { [key: string]: NodeStats },
  orgStats: OrgScoreStatsMapping,
  dependencyStats: DependencyStatsMapping
) {
  if (isParentNode(node)) {
    node.children.forEach((child) =>
      fillNodeStats(child, items, nodeStats, orgStats, dependencyStats)
    );
  } else {
    nodeStats[node.id] = {
      ...items[node.id],
      ...orgStats[node.id],
      ...dependencyStats[node.id],
    };
  }
}
