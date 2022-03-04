import { Edge, GVEdgeMapping } from '../../../types/edge_types';
import { LeafNode } from '../../../types/types';

export function addEdge(edges: GVEdgeMapping, sourceNode: LeafNode, destNode: LeafNode) {
  if (!edges[sourceNode.id]) {
    edges[sourceNode.id] = {
      node: sourceNode,
      outgoing: [],
      incoming: [],
    };
  }
  addEdgeWithWeight(destNode, edges[sourceNode.id].outgoing);

  if (!edges[destNode.id]) {
    edges[destNode.id] = {
      node: destNode,
      outgoing: [],
      incoming: [],
    };
  }
  addEdgeWithWeight(sourceNode, edges[destNode.id].incoming);
}

function addEdgeWithWeight(node: LeafNode, connections: Edge[]) {
  const connectionExists = connections.find((f) => f.node.id === node.id);

  if (connectionExists) {
    connectionExists.dependencyWeight++;
  } else {
    connections.push({
      node,
      dependencyWeight: 1,
    });
  }
}
