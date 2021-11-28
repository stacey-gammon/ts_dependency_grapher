import { LeafNode, NodeStats, ParentNode, GVEdgeMapping } from '../types';
import { getNodeStats } from './coupling_weights';
import { AllNodeStats } from './types';
import { getCouplingWeightMapping } from './get_coupling_weight_mapping';

export function fillNodeStats(node: ParentNode | LeafNode, edges: GVEdgeMapping): AllNodeStats {
  const dependencyStats = {};

  const couplingWeights = getCouplingWeightMapping(edges, dependencyStats);
  const stats = {};
  getNodeStats(couplingWeights, node, dependencyStats, stats);

  const statKeys: Array<keyof NodeStats> = [
    'efferentCoupling',
    'afferentCoupling',
    'interDependencyCount',
    'intraDependencyCount',
    'complexityScore',
    'publicAPICount',
    'orgScore',
    'maxSingleCoupleWeight',
    //  'innerNodeCount',
  ];

  const maxes: Partial<NodeStats> = {};
  statKeys.forEach((stat) => (maxes[stat] = findMaxVal(stats, stat)));
  const mins: Partial<NodeStats> = {};
  statKeys.forEach((stat) => (mins[stat] = findMinVal(stats, stat)));

  return {
    stats,
    maxes,
    mins,
  } as AllNodeStats;
}

function findMaxVal(stats: { [key: string]: NodeStats }, key: keyof NodeStats): number {
  return Object.values(stats).reduce((max, curr) => Math.max(curr[key], max), -999);
}

function findMinVal(stats: { [key: string]: NodeStats }, key: keyof NodeStats): number {
  return Object.values(stats).reduce((max, curr) => Math.min(curr[key], max), 999);
}
