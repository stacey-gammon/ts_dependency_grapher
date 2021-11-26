import { LeafNode, NodeStats, ParentNode, GVEdgeMapping } from '../types';
import { collectNodeCouplingWeights } from './coupling_weights';
import { fillDependencyCounts } from './fill_dependency_counts';
import { RangeWeights } from './types';
import { isLeafNode } from '../zoom/zoom_out';

export function fillNodeStats(node: ParentNode | LeafNode, edges: GVEdgeMapping): RangeWeights {
  // Order is important here.
  fillDependencyCounts(node, edges);
  collectNodeCouplingWeights(node, edges);

  const statKeys: Array<keyof NodeStats> = [
    'efferentCoupling',
    'afferentCoupling',
    'interDependencyCount',
    'intraDependencyCount',
    'complexityScore',
    'publicAPICount',
    'orgScore',
    'maxSingleCoupleWeight',
    'innerNodeCount',
  ];

  const maxes: Partial<NodeStats> = {};
  statKeys.forEach((stat) => (maxes[stat] = findMaxVal(node, stat)));
  const mins: Partial<NodeStats> = {};
  statKeys.forEach((stat) => (mins[stat] = findMinVal(node, stat)));

  return {
    maxes,
    mins,
  } as RangeWeights;
}

function findMaxVal(node: ParentNode | LeafNode, key: keyof LeafNode, max = -999): number {
  if (isLeafNode(node)) {
    const val: number = node[key] as number;
    return val > max ? val : max;
  } else {
    let maxChild = max;
    node.children.forEach((child) => {
      const childSize = findMaxVal(child, key, maxChild);
      if (childSize > maxChild) {
        maxChild = childSize;
      }
    });
    return maxChild;
  }
}

function findMinVal(node: ParentNode | LeafNode, key: keyof LeafNode, min = 999): number {
  if (isLeafNode(node)) {
    const val: number = node[key] as number;
    return val < min ? val : min;
  } else {
    let minChild = min;
    node.children.forEach((child) => {
      const childSize = findMinVal(child, key, minChild);
      if (childSize < minChild) {
        minChild = childSize;
      }
    });
    return minChild;
  }
}
