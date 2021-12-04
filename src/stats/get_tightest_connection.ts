import { Edge } from '../types/edge_types';
import { LeafNode } from '../types/types';
import { ParentConnection } from './get_dependency_stats';

// export function getTightestParentConnection(
//   parentConnections: Array<ParentConnection>,
//   excludeParentNodeId?: string
// ): ParentConnection | undefined {
//   if (parentConnections.length < 0) {
//     throw new Error('Dont call this function with an empty array');
//   }

//   const connectionsCopy = [...parentConnections];
//   if (excludeParentNodeId) {
//     const indexOfSelf = connectionsCopy.findIndex(
//       (conn) => conn.parentNode.id === excludeParentNodeId
//     );
//     if (indexOfSelf >= 0) {
//       connectionsCopy.splice(indexOfSelf, 1);
//     }
//   }

//   if (connectionsCopy.length === 0) return undefined;

//   return connectionsCopy.reduce((max, curr) => {
//     return curr.connectionWeight > max.connectionWeight ? curr : max;
//   }, connectionsCopy[0]);
// }

export function getTightestParentConnection(
  edges: Array<Edge>,
  excludeParentNodeId?: string
): ParentConnection | undefined {
  if (edges.length < 0) {
    throw new Error('Dont call this function with an empty array');
  }

  const edgesByParent = groupEdgesByParent(edges);

  if (excludeParentNodeId) {
    delete edgesByParent[excludeParentNodeId];
  }

  const listOfParents = Object.values(edgesByParent);

  if (listOfParents.length === 0) return undefined;

  const max = listOfParents.reduce(
    (max, edgesToParent) => {
      const depWeight = edgesToParent.reduce((s, e) => s + e.dependencyWeight, 0);
      return depWeight > max.depWeight ? { depWeight, edgesToParent } : max;
    },
    { depWeight: 0, edgesToParent: [] } as { depWeight: number; edgesToParent: Array<Edge> }
  );

  const parentNode = max.edgesToParent[0].node.parentNode;

  if (!parentNode) {
    throw new Error('max.edgesToParent[0].node.parentNode was undefined!');
  }

  return {
    connectionWeight: max.depWeight,
    childConnections: max.edgesToParent,
    parentNode,
  };
}

export function getDependencyWeightForParent(edges: Array<Edge>, parentId: string) {
  return edges.reduce((s, e) => {
    if (e.node.parentNode && e.node.parentNode.id === parentId) {
      return s + e.dependencyWeight;
    } else {
      return s;
    }
  }, 0);
}

function groupEdgesByParent(edges: Array<Edge>) {
  const edgesByParent: { [key: string]: Array<Edge> } = {};

  edges.forEach((edge) => {
    const edgeParent = edge.node.parentNode;
    if (!edgeParent) return;

    if (!edgesByParent[edgeParent.id]) {
      edgesByParent[edgeParent.id] = [];
    }
    edgesByParent[edgeParent.id].push(edge);
  });
  return edgesByParent;
}
