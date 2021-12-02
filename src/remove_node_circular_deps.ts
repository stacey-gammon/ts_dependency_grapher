import { LeafNode, ParentNode } from './types/types';
import { GVEdgeMapping } from './types/edge_types';
import { isLeafNode } from './zoom/zoom_out';

export function removeCircularDependencies(node: ParentNode | LeafNode): ParentNode | LeafNode {
  node.parentNode = undefined;

  if (!isLeafNode(node)) {
    node.children = node.children.map((child) => removeCircularDependencies(child));
  }

  return node;
}

export function removeCircularDependenciesFromEdges(edges: GVEdgeMapping) {
  Object.values(edges).forEach((edge) => {
    edge.node.parentNode = undefined;
    edge.outgoing.forEach((destination) => (destination.node.parentNode = undefined));
  });
}
