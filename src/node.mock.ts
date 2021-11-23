import { LeafNode } from './types';

export function getNode(): LeafNode {
  return {
    incomingDependencyCount: 0,
    publicAPICount: 0,
    innerNodeCount: 0,
    innerDependencyCount: 0,
    complexityScore: 0,
    maxSingleCoupleWeight: 0,
    id: 'foo',
    label: 'foo',
  };
}
