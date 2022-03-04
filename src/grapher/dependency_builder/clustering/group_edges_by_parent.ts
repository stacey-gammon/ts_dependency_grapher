import { Edge } from '../types/edge_types';

export function groupEdgesByParent(edges: Array<Edge>): { [key: string]: Array<Edge> } {
  const edgesByParent: { [key: string]: Array<Edge> } = {};

  edges.forEach((edge) => {
    const parentId = edge.node.parentId;
    if (!parentId) return;

    if (!edgesByParent[parentId]) {
      edgesByParent[parentId] = [];
    }
    edgesByParent[parentId].push(edge);
  });
  return edgesByParent;
}
