import { LeafNode } from '../types/types';
import { Edge, GVEdgeMapping, NodeEdges } from '../types/edge_types';

/**
 *
 * When we zoom out the nodes, we need to zoom out the edges. If a node root_foo_bar got rolled up to
 * root_foo, and root_zed.ts has a dependency on root_foo_bar, we need to fix the edges so root_zed.ts depends
 * on root_foo.
 *
 * @param edges
 * @param oldLeafToNewLeaf
 * @param zoomedRoot
 * @returns
 */
export function rollupEdges(
  edges: GVEdgeMapping,
  oldLeafToNewLeaf: { [key: string]: LeafNode }
): GVEdgeMapping {
  const zoomedOutEdges: GVEdgeMapping = {};

  console.log(`Before zooming out there are ${Object.keys(edges).length} edges`);
  Object.values(edges).forEach((oldEdge) => {
    zoomEdgeOut(edges, zoomedOutEdges, oldEdge, oldLeafToNewLeaf);
  });

  console.log(`After zooming out there are ${Object.keys(zoomedOutEdges).length} edges`);
  return zoomedOutEdges;
}

function zoomEdgeOut(
  oldEdges: GVEdgeMapping,
  zoomedOutEdges: GVEdgeMapping,
  oldNodeEdges: NodeEdges,
  oldLeafToNewLeaf: { [key: string]: LeafNode }
) {
  const oldLeaf = oldNodeEdges.node;
  const oldOutgoingEdges = oldNodeEdges.outgoing;
  const oldIncomingEdges = oldNodeEdges.incoming;

  // If the edge wasn't deep enough in the tree to have been zoomed out, it won't be in oldLeafToNewLeaf.
  const newLeaf: LeafNode = oldLeafToNewLeaf[oldLeaf.id] || oldEdges[oldLeaf.id].node;
  const newLeafId = newLeaf.id;

  if (zoomedOutEdges[newLeafId] === undefined) {
    zoomedOutEdges[newLeafId] = {
      node: newLeaf,
      outgoing: [],
      incoming: [],
    };
  }

  oldOutgoingEdges.map(({ node, dependencyWeight }) => {
    addOrUpdateConnection(
      newLeaf,
      node,
      dependencyWeight,
      oldLeafToNewLeaf,
      zoomedOutEdges[newLeafId].outgoing
    );
  });

  oldIncomingEdges.forEach(({ node, dependencyWeight }) => {
    addOrUpdateConnection(
      newLeaf,
      node,
      dependencyWeight,
      oldLeafToNewLeaf,
      zoomedOutEdges[newLeafId].incoming
    );
  });
}

function addOrUpdateConnection(
  newLeaf: LeafNode,
  oldConnection: LeafNode,
  dependencyWeight: number,
  oldLeafToNewLeaf: { [key: string]: LeafNode },
  connections: Array<Edge>
) {
  const newConnection = oldLeafToNewLeaf[oldConnection.id] || oldConnection;

  // The Edge is no longer an edge, since they rolled up to the same node. E.g. rolling up
  // A/B -> A/C will become A -> A
  if (newLeaf.id == newConnection.id) {
    // We may eventually wish to track this number as an inner dependency count.
    return;
  }

  const existingConnection = connections.find(({ node }) => node.id === newConnection.id);

  if (existingConnection) {
    existingConnection.dependencyWeight += dependencyWeight || 0;
  } else {
    connections.push({
      node: newConnection,
      dependencyWeight: dependencyWeight,
    });
  }
}
