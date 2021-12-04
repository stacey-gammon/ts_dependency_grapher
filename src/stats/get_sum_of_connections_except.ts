import { Edge } from '../types/edge_types';
import { ParentConnection } from './get_dependency_stats';

// export function getSumOfConnectionsExcept(
//   allConnections: ParentConnection[],
//   excludedParent?: ParentConnection
// ) {
//   return allConnections.reduce((sum, conn) => {
//     if (excludedParent && conn.parentNode.id !== excludedParent.parentNode.id) {
//       return sum + conn.connectionWeight;
//     }
//     return sum;
//   }, 0);
// }

export function getSumOfConnections(edges: Array<Edge>, excludedParentId?: string) {
  return edges.reduce((sum, edge) => {
    if (!excludedParentId) return sum + edge.dependencyWeight;

    if (edge.node.parentNode && edge.node.parentNode.id !== excludedParentId) {
      return sum + edge.dependencyWeight;
    }

    return sum;
  }, 0);
}
