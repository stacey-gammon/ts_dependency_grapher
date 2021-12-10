import { Edge } from '../types/edge_types';

export function getSumOfConnections(edges: Array<Edge>, excludedParentId?: string) {
  return edges.reduce((sum, edge) => {
    if (!excludedParentId) return sum + edge.dependencyWeight;

    if (edge.node.parentNode && edge.node.parentNode.id !== excludedParentId) {
      return sum + edge.dependencyWeight;
    }

    return sum;
  }, 0);
}
