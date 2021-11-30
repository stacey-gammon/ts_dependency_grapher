import { ParentConnection } from './get_dependency_stats';

export function getTightestParentConnection(
  parentConnections: Array<ParentConnection>
): ParentConnection {
  if (parentConnections.length < 0) {
    throw new Error('Dont call this function with an empty array');
  }

  return parentConnections.reduce((max, curr) => {
    return curr.connectionWeight > max.connectionWeight ? curr : max;
  }, parentConnections[0]);
}
