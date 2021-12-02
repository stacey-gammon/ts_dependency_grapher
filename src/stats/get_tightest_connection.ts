import { ParentConnection } from './get_dependency_stats';

export function getTightestParentConnection(
  parentConnections: Array<ParentConnection>,
  excludeParentNodeId?: string
): ParentConnection | undefined {
  if (parentConnections.length < 0) {
    throw new Error('Dont call this function with an empty array');
  }

  const connectionsCopy = [...parentConnections];
  if (excludeParentNodeId) {
    const indexOfSelf = connectionsCopy.findIndex(
      (conn) => conn.parentNode.id === excludeParentNodeId
    );
    if (indexOfSelf >= 0) {
      connectionsCopy.splice(indexOfSelf, 1);
    }
  }

  if (connectionsCopy.length === 0) return undefined;

  return connectionsCopy.reduce((max, curr) => {
    return curr.connectionWeight > max.connectionWeight ? curr : max;
  }, connectionsCopy[0]);
}
