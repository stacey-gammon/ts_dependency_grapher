import { CouplingWeightMapping, GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { getParentFolder } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';

export function collectNodeCouplingWeights(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping
): CouplingWeightMapping {
  const nodeCouplingWeights: CouplingWeightMapping = {};

  Object.keys(edges).forEach((sourceId) => {
    const source = edges[sourceId].source;
    const sourceParent = getParentFolder(source.filePath);

    edges[sourceId].destinations.forEach(({ destinationNode, dependencyWeight }) => {
      const destinationParentFolder = getParentFolder(destinationNode.filePath);

      if (destinationParentFolder === sourceParent) return;

      if (!nodeCouplingWeights[destinationNode.id]) {
        nodeCouplingWeights[destinationNode.id] = [];
      }
      if (!nodeCouplingWeights[sourceId]) {
        nodeCouplingWeights[sourceId] = [];
      }

      const interConn = nodeCouplingWeights[destinationNode.id].find(
        (f) => f.connectionId === sourceParent
      );

      if (!interConn) {
        nodeCouplingWeights[destinationNode.id].push({
          connectionId: sourceParent,
          connectionWeight: dependencyWeight,
        });
      } else {
        interConn.connectionWeight += dependencyWeight;
      }

      const intraCon = nodeCouplingWeights[sourceId].find(
        (f) => f.connectionId === destinationParentFolder
      );

      if (!intraCon) {
        nodeCouplingWeights[sourceId].push({
          connectionId: destinationParentFolder,
          connectionWeight: dependencyWeight,
        });
      } else {
        intraCon.connectionWeight += dependencyWeight;
      }
    });
  });

  fillCouplingWeight(nodeCouplingWeights, root);

  return nodeCouplingWeights;
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
export function getMaxCoupledWeight(node: ParentNode | LeafNode, max = 0): number {
  if (isLeafNode(node)) {
    return node.maxSingleCoupleWeight > max ? node.maxSingleCoupleWeight : max;
  } else {
    const kidCounts = node.children.map((child) => getMaxCoupledWeight(child, max));
    return Math.max(...kidCounts, max);
  }
}

function fillCouplingWeight(weights: CouplingWeightMapping, node: ParentNode | LeafNode) {
  if (isLeafNode(node)) {
    if (weights[node.id]) {
      const max = weights[node.id].reduce(
        (max, curr) => (curr.connectionWeight > max.connectionWeight ? curr : max),
        { connectionId: '', connectionWeight: 0 }
      );
      node.maxSingleCoupleWeight = max.connectionWeight;
      node.orgScore = node.interDependencyCount - node.maxSingleCoupleWeight;
      if (node.orgScore < 0) {
        console.error(`Consider moving node ${node.id} to ${max.connectionId}`);
      }
    }
  } else {
    node.children.forEach((child) => fillCouplingWeight(weights, child));
  }
}
