import { Edge } from '../types/edge_types';
import { ParentConnection } from './get_dependency_stats';

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

  const parentId = max.edgesToParent[0].node.parentId;

  if (!parentId) {
    throw new Error('max.edgesToParent[0].node.parentId was undefined!');
  }

  return {
    connectionWeight: max.depWeight,
    childConnections: max.edgesToParent,
    parentId,
  };
}

export function getDependencyWeightForParent(edges: Array<Edge>, parentId: string) {
  return edges.reduce((s, e) => {
    if (e.node.parentId && e.node.parentId === parentId) {
      return s + e.dependencyWeight;
    } else {
      return s;
    }
  }, 0);
}

function groupEdgesByParent(edges: Array<Edge>) {
  const edgesByParent: { [key: string]: Array<Edge> } = {};

  edges.forEach((edge) => {
    const edgeParentId = edge.node.parentId;
    if (!edgeParentId) return;

    if (!edgesByParent[edgeParentId]) {
      edgesByParent[edgeParentId] = [];
    }
    edgesByParent[edgeParentId].push(edge);
  });
  return edgesByParent;
}
