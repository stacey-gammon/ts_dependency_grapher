import { LeafNode, NodeStats, ParentNode } from '../types';
import { getEmptyNodeCounts } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';
import { CouplingWeightMapping, DependencyStatsMapping } from './get_coupling_weight_mapping';

export interface CoupledConnection {
  parentNode: ParentNode;
  connectionWeight: number;
}

export function getNodeStats(
  weights: CouplingWeightMapping,
  node: ParentNode | LeafNode,
  depStats: DependencyStatsMapping,
  nodeStats: { [key: string]: NodeStats }
) {
  if (isLeafNode(node)) {
    let maxSingleCoupleWeight = 0;
    if (weights[node.id]) {
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
      const orgScore = depStats[node.id].interDependencyCount - maxSingleCoupleWeight;
      maxSingleCoupleWeight = connectionWeight;
      if (parentNode && orgScore < 0) {
        console.log(`Consider moving node ${node.id} to ${parentNode.filePath}`);
      }
    }

    const orgScore = depStats[node.id].interDependencyCount - maxSingleCoupleWeight;

    nodeStats[node.id] = {
      ...getEmptyNodeCounts(),
      ...depStats[node.id],
      publicAPICount: node.publicAPICount,
      complexityScore: node.complexityScore,
      maxSingleCoupleWeight,
      orgScore,
    };
  } else {
    node.children.forEach((child) => getNodeStats(weights, child, depStats, nodeStats));
  }
}
