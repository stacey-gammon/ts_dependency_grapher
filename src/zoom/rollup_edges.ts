import { GVEdgeMapping, LeafNode, ParentNode } from '../types';

/**
 *
 * When we zoom out the nodes, we need to zoom out the edges. If a node root_foo_bar got rolled up to
 * root_foo, and root_zed.ts has a dependency on root_foo_bar, we need to fix the edges so root_zed.ts depends
 * on root_foo.
 *
 * @param leafSourceEdges
 * @param leafToParentId
 * @param zoomedRoot
 * @returns
 */
export function rollupEdges(
  leafSourceEdges: GVEdgeMapping,
  leafToParentId: { [key: string]: ParentNode }
): GVEdgeMapping {
  const rolledUpEdges: GVEdgeMapping = {};
  const innerDependencyCount: { [key: string]: number } = {};

  Object.keys(leafSourceEdges).forEach((leafSource) => {
    const leafDestEdges = leafSourceEdges[leafSource].destinations;

    if (leafDestEdges === undefined) {
      console.error(`leafDestEdges is undefined! from ${leafSource}`, leafSourceEdges[leafSource]);
      throw new Error(`leafDestEdges is undefined! from ${leafSource}`);
    }

    const sourceParentNode: ParentNode | LeafNode =
      leafToParentId[leafSource] || leafSourceEdges[leafSource].source;
    const sourceParentId = sourceParentNode.id;
    if (sourceParentId === undefined) {
      console.error(
        `sourceParentId is undefined. leafToParentId[${leafSource}] is `,
        leafToParentId[leafSource]
      );
      throw new Error('rollupEdges: Source id should never be undefined');
    }

    if (rolledUpEdges[sourceParentId] === undefined) {
      rolledUpEdges[sourceParentId] = {
        source: sourceParentNode,
        destinations: [],
      };
    }

    leafDestEdges.forEach(({ destinationNode, dependencyWeight }) => {
      if (
        leafToParentId[destinationNode.id] === leafToParentId[leafSource] &&
        leafToParentId[leafSource] !== undefined
      ) {
        if (!innerDependencyCount[sourceParentId]) innerDependencyCount[sourceParentId] = 0;
        innerDependencyCount[sourceParentId]++;
      }

      const destinationParentNode = leafToParentId[destinationNode.id] || destinationNode;
      const destinationParentId = destinationParentNode.id;

      const rolledUpEdge = rolledUpEdges[sourceParentId].destinations.find(
        ({ destinationNode }) => destinationNode.id === destinationParentId
      );

      if (!rolledUpEdge && sourceParentId != destinationParentId) {
        rolledUpEdges[sourceParentId].destinations.push({
          destinationNode: destinationParentNode,
          dependencyWeight: dependencyWeight,
        });
      } else if (rolledUpEdge) {
        rolledUpEdge.dependencyWeight += dependencyWeight || 0;
      }
    });
  });

  return rolledUpEdges;
}
