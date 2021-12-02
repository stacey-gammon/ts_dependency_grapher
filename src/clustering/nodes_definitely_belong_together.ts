import { Edge, GVEdgeMapping } from '../types/edge_types';
import { LeafNode } from '../types/types';

export function nodesDefinitelyBelongTogether(
  node1: LeafNode,
  node2: LeafNode,
  edges: GVEdgeMapping
) {
  const node1Edges = edges[node1.id];
  const node2Edges = edges[node2.id];

  if (!node1Edges || !node2Edges) return false;

  const node1Conns: Array<Edge> = [...node1Edges.incoming, ...node1Edges.outgoing];
  if (node1Conns.length === 1 && node1Conns[0].node.id === node2.id) return true;
  const node2Conns = [...node2Edges.incoming, ...node2Edges.outgoing];
  if (node2Conns.length === 1 && node2Conns[0].node.id === node1.id) return true;

  return false;
}
