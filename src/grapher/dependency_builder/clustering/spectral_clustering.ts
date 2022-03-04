// import { isLeafNode } from '../zoom/zoom_out';
// import { LeafNode, ParentNode } from '../types/types';
// import { Edge, GVEdgeMapping } from '../types/edge_types';
// import nconf from 'nconf';

import { GVEdgeMapping } from '../types/edge_types';
import { LeafNode, ParentNode } from '../types/types';

// import { Graph, SpectralClustering, Node } from 'spectral-clustering-js';

// // at this point, each node in the graph has an integer cluster property

// // display

// export function spectralRecluster(
//   node: ParentNode | LeafNode,
//   edges: GVEdgeMapping,
//   clusters: Array<Array<LeafNode>> = [],
//   noiseNodes: Array<LeafNode> = [],
//   visitedNodes: { [key: string]: boolean } = {},
//   nodeToClusterIndex: { [key: string]: number } = {},
//   cluster?: { cluster: Array<LeafNode>; currClusterIndex: number }
// ) {
//   const graph = new Graph();
//   addGraphNodes(graph, node, edges)
//   // create nodes, link your nodes ...

//   const s = new SpectralClustering(graph);
//   const options = new Map<string, string | number>([
//     ['requestedNbClusters', 4], // to find exactly 4 clusters. Do not set to let the package find how many clusters
//     ['maxClusters', 6], // do not find more than 6 clusters (only if requestedNbClusters is not set)
//     ['laplacianMatrix', 'connected'], // consider the connections between nodes without considering the distance between them. Set "distance" to considers the distance between the nodes.
//   ]);
//   s.compute(options);
// }

// function addGraphNodes(graph: Graph, node: ParentNode | LeafNode,
//     edges: GVEdgeMapping) {
//   if (isLeafNode(node)) {
//     graph.addNode(convertToSCNode(node, edges));
//   }
// }

// function convertToSCNode(node: ParentNode | LeafNode, edges: GVEdgeMapping): Node {
//   const scNode = new Node([0,0]);
//   scNode.set
//   return {
//     ...node,
//     connectedNodes: edges[]
//   };
// }

/**
 * See https://cdn.substack.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc159549-97fe-4b04-9817-86736a3e1d96_2150x688.png
 */
function createLaplacianMatrix(nodes: LeafNode | ParentNode, edges: GVEdgeMapping) {
  const lMatrix: [][] = [];
}
