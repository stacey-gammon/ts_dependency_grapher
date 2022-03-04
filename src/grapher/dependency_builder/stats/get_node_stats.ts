import { LeafNode, ParentNode } from '../types/types';
import { NodeStats } from '../types/node_stats';
import { GVEdgeMapping } from '../types/edge_types';
import { AllNodeStats, RecommendationsList } from './types';
import { fillDependencyStats } from './get_dependency_stats';
import { fillNodeStats } from './fill_node_stats';
import { fillOrgScoreStats, OrgScoreStatsMapping } from './fill_org_score_stats';
import { ApiItemMap } from '../types';

export function getNodeStats(
  node: ParentNode | LeafNode,
  items: ApiItemMap,
  edges: GVEdgeMapping
): AllNodeStats {
  const orgStats: OrgScoreStatsMapping = {};
  const nodeStats: { [key: string]: NodeStats } = {};
  const dependencyStats = {};

  // Grouped by parent that has the node that should move. This is to help avoid one giant module. Do one move per parent at a time.
  const recommendations: RecommendationsList = [];
  fillDependencyStats(edges, dependencyStats);
  fillOrgScoreStats(node, items, edges, orgStats);
  fillNodeStats(node, nodeStats, orgStats, dependencyStats);

  const statKeys: Array<keyof NodeStats> = [
    'efferentCoupling',
    'afferentCoupling',
    'interDependencyCount',
    'intraDependencyCount',
    'complexityScore',
    'publicAPICount',
    'orgScore',
    'tightestConnectionWeight',
    //  'innerNodeCount',
  ];
  const maxes: Partial<NodeStats> = {};
  statKeys.forEach((stat) => ((maxes[stat] as number) = findMaxVal(nodeStats, stat)));

  const mins: Partial<NodeStats> = {};
  statKeys.forEach((stat) => ((mins[stat] as number) = findMinVal(nodeStats, stat)));

  return {
    stats: nodeStats,
    maxes,
    mins,
    recommendations,
  } as AllNodeStats;
}

function findMaxVal(stats: { [key: string]: NodeStats }, key: keyof NodeStats): number {
  return Object.values(stats).reduce((max, curr) => {
    return Math.max(curr[key] as number, max);
  }, -999);
}

function findMinVal(stats: { [key: string]: NodeStats }, key: keyof NodeStats): number {
  return Object.values(stats).reduce((max, curr) => Math.min(curr[key] as number, max), 999);
}
