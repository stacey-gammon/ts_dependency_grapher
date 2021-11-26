import { LeafNode, ParentNode } from '../types';
import { isLeafNode } from '../zoom/zoom_out';

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
