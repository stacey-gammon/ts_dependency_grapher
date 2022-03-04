import { ApiItemMap, Edge } from '../types';

export function getSumOfConnections(
  edges: Array<Edge>,
  items: ApiItemMap,
  excludedParentId?: string
) {
  return edges.reduce((sum, edge) => {
    if (!excludedParentId) return sum + edge.dependencyWeight;

    if (edge.node.parentId && items[edge.node.parentId].id !== excludedParentId) {
      return sum + edge.dependencyWeight;
    }

    return sum;
  }, 0);
}
