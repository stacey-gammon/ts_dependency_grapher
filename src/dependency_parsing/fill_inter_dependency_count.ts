import { GVEdgeMapping } from '../types';
import { getParentFolder } from '../utils';

export function fillInnerDependencyCounts(edges: GVEdgeMapping) {
  Object.keys(edges).forEach((sourceId) => {
    const destinations = edges[sourceId].destinations;
    const source = edges[sourceId].source;
    destinations.forEach((destination) => {
      const sourceParent = getParentFolder(source.filePath);
      const destinationParent = getParentFolder(destination.destinationNode.filePath);
      if (sourceParent === destinationParent) {
        source.interDependencyCount++;
        destination.destinationNode.interDependencyCount++;
      }
    });
  });
}
