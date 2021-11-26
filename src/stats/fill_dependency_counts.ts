import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { getParentFolder } from '../utils';

export function fillDependencyCounts(node: ParentNode | LeafNode, edges: GVEdgeMapping) {
  Object.keys(edges).forEach((edgeId) => {
    const edge = edges[edgeId];

    const sourceParentPath = getParentFolder(edge.source.filePath);
    edge.destinations.forEach(({ destinationNode, dependencyWeight }) => {
      const destParentPath = getParentFolder(destinationNode.filePath);
      // edge would be the longer file path, root/foo/bar, node is the parent, root/foo for example.
      if (sourceParentPath === destParentPath) {
        edge.source.interDependencyCount += dependencyWeight;
        destinationNode.interDependencyCount += dependencyWeight;
      } else {
        edge.source.intraDependencyCount += dependencyWeight;
        destinationNode.intraDependencyCount += dependencyWeight;

        edge.source.efferentCoupling += dependencyWeight;
        destinationNode.afferentCoupling += dependencyWeight;
      }
    });
  });
}
