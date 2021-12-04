import { Edge } from '../types/edge_types';

export function groupEdgesByParent(edges: Array<Edge>): { [key: string]: Array<Edge> } {
  const edgesByParent: { [key: string]: Array<Edge> } = {};

  edges.forEach((edge) => {
    const parentNode = edge.node.parentNode;
    if (!parentNode) return;

    if (!edgesByParent[parentNode.id]) {
      edgesByParent[parentNode.id] = [];
    }
    edgesByParent[parentNode.id].push(edge);
  });
  return edgesByParent;
}
