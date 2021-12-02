// import { isLeafNode } from '../zoom/zoom_out';
// import { LeafNode, ParentNode } from '../types/types';
// import { Edge, GVEdgeMapping } from '../types/edge_types';
// import nconf from 'nconf';

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
