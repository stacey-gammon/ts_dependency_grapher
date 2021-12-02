import { ParentConnection } from './get_dependency_stats';

export function getSumOfConnectionsExcept(
  allConnections: ParentConnection[],
  excludedParent?: ParentConnection
) {
  return allConnections.reduce((sum, conn) => {
    if (excludedParent && conn.parentNode.id !== excludedParent.parentNode.id) {
      return sum + conn.connectionWeight;
    }
    return sum;
  }, 0);
}
