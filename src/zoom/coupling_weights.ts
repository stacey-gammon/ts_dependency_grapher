import { CouplingWeightMapping, GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { isGVNode } from './zoom_out';

export function collectNodeCouplingWeights(
  edges: GVEdgeMapping,
  root: ParentNode | LeafNode
): CouplingWeightMapping {
  const nodeCouplingWeights: CouplingWeightMapping = {};

  Object.keys(edges).forEach((source) => {
    edges[source].forEach((dest) => {
      if (!nodeCouplingWeights[dest.dest]) {
        nodeCouplingWeights[dest.dest] = {};
      }
      if (!nodeCouplingWeights[source]) {
        nodeCouplingWeights[source] = {};
      }

      if (!nodeCouplingWeights[dest.dest][source]) {
        nodeCouplingWeights[dest.dest][source] = 0;
      }
      if (!nodeCouplingWeights[source][dest.dest]) {
        nodeCouplingWeights[source][dest.dest] = 0;
      }

      nodeCouplingWeights[dest.dest][source] += dest.weight;
      nodeCouplingWeights[source][dest.dest] += dest.weight;
    });
  });

  fillCouplingWeight(nodeCouplingWeights, root);

  return nodeCouplingWeights;
}

export function getMaxCoupledWeight(node: ParentNode | LeafNode, max = 0): number {
  if (isGVNode(node)) {
    return node.maxSingleCoupleWeight > max ? node.maxSingleCoupleWeight : max;
  } else {
    const kidCounts = node.children.map((child) => getMaxCoupledWeight(child, max));
    return Math.max(...kidCounts, max);
  }
}

function fillCouplingWeight(weights: CouplingWeightMapping, node: ParentNode | LeafNode) {
  if (isGVNode(node)) {
    if (weights[node.id]) {
      const connectedNodeWeights: number[] = Object.values(weights[node.id]);
      node.maxSingleCoupleWeight = Math.max(...connectedNodeWeights);
    }
  } else {
    node.children.forEach((child) => fillCouplingWeight(weights, child));
  }
}

/**
 *
 * @param dest
 * @param destMapping
 * @param edges
 * @returns the sum of the incoming dependency count plus outgoing dependency count from a single node. For example, if there are the following edges
 * with the following weights:
 * A -> B, weight: 10
 * B -> A, weight: 10
 * A -> C, weight: 5
 * C -> B, weight : 5
 *
 * Then the tightest coupled nodes would be A and B and a score of 20 would be returned.
 */
export function getTightestCoupledNodeCount(node: string, destMapping: CouplingWeightMapping) {
  const nodeWeights: { [node: string]: number } = destMapping[node] || {};

  return Object.keys(nodeWeights).reduce((max, connectionNode) => {
    const nodeWeight = nodeWeights[connectionNode];
    if (nodeWeight > max) return nodeWeight;
    return max;
  }, 0);
}
