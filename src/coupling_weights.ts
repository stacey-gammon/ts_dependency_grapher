import { CouplingWeightMapping, GVEdgeMapping } from "./types";


export function collectNodeCouplingWeights(edges: GVEdgeMapping): CouplingWeightMapping {
  const nodeCouplingWeights: CouplingWeightMapping = {};

  Object.keys(edges).forEach(source => {
    edges[source].forEach(dest => {
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
    })
  });

  return nodeCouplingWeights;
}

export function getMaxCoupledWeight(weights: CouplingWeightMapping): number {
  return Object.keys(weights).reduce((max, aNode) => {
     const maxNodeConnectionWeight = Object.keys(weights[aNode]).reduce((maxNodeWeight, bNode) => {
      const thisPairWeight = weights[aNode][bNode];
      return Math.max(thisPairWeight, maxNodeWeight);
     }, max);
     return Math.max(maxNodeConnectionWeight, max);
    }, 0);
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

  return Object.keys(nodeWeights).reduce((max, connectionNode)  => {
    const nodeWeight = nodeWeights[connectionNode];
    if (nodeWeight > max) return nodeWeight;
    return max;
  } ,0)
}
