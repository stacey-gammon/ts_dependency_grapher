import { LeafNode, NodeStats, ParentNode } from '../types';
import { getEmptyNodeCounts } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';
import {
  NodeToParentDependencies,
  DependencyStatsMapping,
} from './get_source_to_destination_parent_mapping';

export interface CoupledConnection {
  parentNode: ParentNode;
  connectionWeight: number;
}

/**
 * Returns whether or not modifications were made and scores should be re-calculated
 * @param weights
 * @param node
 * @param depStats
 * @param nodeStats
 * @param takeRecommendations
 */
export function getNodeStats(
  weights: NodeToParentDependencies,
  node: ParentNode | LeafNode,
  depStats: DependencyStatsMapping,
  nodeStats: { [key: string]: NodeStats },
  recommendations: { [key: string]: Array<{ node: LeafNode; newParent: ParentNode }> }
) {
  if (isLeafNode(node)) {
    let maxSingleCoupleWeight = 0;
    const interDependencyCount = depStats[node.id].interDependencyCount;
    if (weights[node.id]) {
      // interDependencyCount =
      //   weights[node.id].find((weight) => {
      //     console.log(`${weight.parentNode.id} === ${node.parentNode?.id};`);
      //     return weight.parentNode.id === node.parentNode?.id;
      //   })?.connectionWeight || 0;

      const { connectionWeight, parentNode } = weights[node.id].reduce(
        (max, curr) => {
          // Skip inter counts
          if (node.parentNode && curr.parentNode.id === node.parentNode.id) return max;

          return curr.connectionWeight > max.connectionWeight ? curr : max;
        },
        { parentNode: undefined, connectionWeight: 0 } as {
          parentNode?: ParentNode;
          connectionWeight: number;
        }
      );

      if (connectionWeight === undefined) {
        console.error(`fillCouplingWeight: ConnectionWeight not found for ${node.id}.`, weights);
        throw new Error('fillCouplingWeight: ConnectionWeight should be defined');
      }
      maxSingleCoupleWeight = connectionWeight;
      const orgScore = interDependencyCount - maxSingleCoupleWeight;
      if (parentNode && orgScore < 0) {
        if (!recommendations[parentNode.id]) recommendations[parentNode.id] = [];

        recommendations[parentNode.id].push({ node, newParent: parentNode });
        console.log(
          `Consider moving ${node.filePath} to ${parentNode.filePath}, recommendations: ${recommendations.length}`
        );
      }
    }

    nodeStats[node.id] = {
      ...getEmptyNodeCounts(),
      ...depStats[node.id],
      interDependencyCount,
      publicAPICount: node.publicAPICount,
      complexityScore: node.complexityScore,
      maxSingleCoupleWeight,
      orgScore: depStats[node.id].interDependencyCount - maxSingleCoupleWeight,
    };
  } else {
    node.children.forEach((child) =>
      getNodeStats(weights, child, depStats, nodeStats, recommendations)
    );
  }
  return recommendations;
}

// function findRecommendation(recommendations: {
//   [key: string]: Array<{ node: LeafNode; newParent: ParentNode }>;
//   node: LeafNode,
//   dest: ParentNode,
// }) {

// }
