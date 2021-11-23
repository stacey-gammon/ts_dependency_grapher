import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { isGVNode } from './zoom_out';

export function rollupEdges(
  leafSourceEdges: GVEdgeMapping,
  leafToParentId: { [key: string]: string },
  zoomedRoot: ParentNode | LeafNode
): GVEdgeMapping {
  const rolledUpEdges: GVEdgeMapping = {};
  const innerDependencyCount: { [key: string]: number } = {};

  Object.keys(leafSourceEdges).forEach((leafSource) => {
    const leafDestEdges = leafSourceEdges[leafSource];
    const rolledUpSource = leafToParentId[leafSource] || leafSource;

    if (rolledUpEdges[rolledUpSource] === undefined) {
      rolledUpEdges[rolledUpSource] = [];
    }
    leafDestEdges.forEach((leafDestEdge) => {
      if (
        leafToParentId[leafDestEdge.dest] === leafToParentId[leafSource] &&
        leafToParentId[leafSource] !== undefined
      ) {
        if (!innerDependencyCount[rolledUpSource]) innerDependencyCount[rolledUpSource] = 0;
        innerDependencyCount[rolledUpSource]++;
      }

      const parentDest = leafToParentId[leafDestEdge.dest] || leafDestEdge.dest;
      const rolledUpEdge = rolledUpEdges[rolledUpSource].find((e) => e.dest === parentDest);
      if (!rolledUpEdge && rolledUpSource != parentDest) {
        rolledUpEdges[rolledUpSource].push({
          dest: parentDest,
          weight: leafDestEdge.weight,
        });
      } else if (rolledUpEdge) {
        rolledUpEdge.weight += leafDestEdge.weight || 0;
      }
    });
  });

  fillInnerDependencyCounts(zoomedRoot, innerDependencyCount);
  return rolledUpEdges;
}

function fillInnerDependencyCounts(
  node: ParentNode | LeafNode,
  innerDependencyCount: { [key: string]: number }
) {
  if (isGVNode(node)) {
    node.innerDependencyCount = innerDependencyCount[node.id];
  } else {
    node.children.forEach((child) => {
      fillInnerDependencyCounts(child, innerDependencyCount);
    });
  }
}
