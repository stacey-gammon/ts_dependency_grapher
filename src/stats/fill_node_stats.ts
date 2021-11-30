import { LeafNode, NodeStats, ParentNode, GVEdgeMapping } from '../types';
import { getNodeStats } from './get_node_stats';
import { AllNodeStats, RecommendationsByParent, RecommendationsList } from './types';
import {
  getParentConnections,
  getSourceToDestinationParentMapping,
} from './get_source_to_destination_parent_mapping';
import { moveNode } from './move_node';
import { getTightestParentConnection } from './get_tightest_connection';

export function fillNodeStats(
  node: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  takeRecommendationsSetting = false
): AllNodeStats {
  let iterations = 0;
  const MAX_ITERATIONS = 5;
  let stats: { [key: string]: NodeStats } = {};
  let dependencyStats = {};

  // Grouped by parent that has the node that should move. This is to help avoid one giant module. Do one move per parent at a time.
  let recommendations: RecommendationsByParent = {};

  // This is the list of recommendations that were actually taken. They will vary as each recommendation needs to be re-calculated to
  // take into account earlier moves.
  const actualRecommendations: RecommendationsList = [];

  while (iterations < MAX_ITERATIONS) {
    recommendations = {};
    dependencyStats = {};
    stats = {};
    const couplingWeights = getSourceToDestinationParentMapping(edges, dependencyStats);
    getNodeStats(couplingWeights, node, dependencyStats, stats, recommendations);
    const totalOrgScore = Object.values(stats).reduce((sum, stat) => stat.orgScore + sum, 0);
    console.log(
      `${iterations} Total org score: ${totalOrgScore} with ${recommendations.length} recommendations`
    );
    if (Object.keys(recommendations).length === 0 || !takeRecommendationsSetting) {
      break;
    } else {
      takeRecommendations(recommendations, edges, actualRecommendations);
      iterations++;
    }
  }

  const couplingWeights = getSourceToDestinationParentMapping(edges, dependencyStats);
  getNodeStats(couplingWeights, node, dependencyStats, stats, {});

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
    recommendations: actualRecommendations,
  } as AllNodeStats;
}

function findMaxVal(stats: { [key: string]: NodeStats }, key: keyof NodeStats): number {
  return Object.values(stats).reduce((max, curr) => Math.max(curr[key], max), -999);
}

function findMinVal(stats: { [key: string]: NodeStats }, key: keyof NodeStats): number {
  return Object.values(stats).reduce((max, curr) => Math.min(curr[key], max), 999);
}

function takeRecommendations(
  recommendations: RecommendationsByParent,
  edges: GVEdgeMapping,
  actualRecommendations: RecommendationsList
) {
  const keys = Object.keys(recommendations);
  if (keys.length === 0) return;

  keys.forEach((key) => {
    let keepTakingForThisParent = true;
    while (keepTakingForThisParent) {
      console.log('keepTakingForThisParent stil stru');
      if (recommendations[key].length === 0) {
        console.log('deleted key ' + key + 'from recs');
        delete recommendations[key];
        keepTakingForThisParent = false;
        break;
      }

      const recommendation = recommendations[key][0];

      console.log(
        `Recommendation is to move ${recommendation.node.id} to ${recommendation.newParent.id}`
      );
      const parentConnections = getParentConnections(recommendation.node, edges);

      if (parentConnections.length > 0) {
        const newParent = getTightestParentConnection(parentConnections);

        recommendations[key].splice(0, 1);

        // Given the last move, this move is now a no-op, to keep the tree even, stay with this parent before going on to next.
        if (newParent.parentNode.id !== recommendation.node.parentNode?.id) {
          console.log(`Moving ${recommendation.node.id} to ${newParent.parentNode.id}`);
          actualRecommendations.push(recommendation);
          moveNode(recommendation.node, newParent.parentNode);
          keepTakingForThisParent = false;
          break;
        }
      } else {
        keepTakingForThisParent = false;
        break;
      }
    }
  });
}
