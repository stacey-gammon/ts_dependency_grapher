import { GVEdgeMapping, LeafNode, ParentNode } from './types';
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
    edge.source.parentNode = undefined;
    edge.destinations.forEach(
      (destination) => (destination.destinationNode.parentNode = undefined)
    );
  });
}
