import { isLeafNode } from '../utils';
import { LeafNode, ParentNode, Edge, GVEdgeMapping } from '../types';
import nconf from 'nconf';

export function dbScanRecluster(
  node: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  clusters: Array<Array<LeafNode>> = [],
  noiseNodes: Array<LeafNode> = [],
  visitedNodes: { [key: string]: boolean } = {},
  nodeToClusterIndex: { [key: string]: number } = {}
) {
  const cluster = { cluster: [], currClusterIndex: 0 };
  let minPts = nconf.get('minPts') || 3;
  let minDistance = nconf.get('minDistance') || 0;

  dbScanReclusterInner(
    node,
    edges,
    clusters,
    noiseNodes,
    visitedNodes,
    nodeToClusterIndex,
    cluster,
    minPts,
    minDistance
  );

  while (noiseNodes.length > 0) {
    minPts--;
    minDistance--;
    console.log(
      `noiseNodes.length is ${noiseNodes.length} running again with minPts: ${minPts} and minDistance:${minDistance}`
    );
    noiseNodes.forEach((n) => (visitedNodes[n.id] = false));
    dbScanReclusterInner(
      node,
      edges,
      clusters,
      noiseNodes,
      visitedNodes,
      nodeToClusterIndex,
      cluster,
      minPts,
      minDistance
    );
  }
}

/**
 * Uses https://towardsdatascience.com/the-5-clustering-algorithms-data-scientists-need-to-know-a36d136ef68 DBSCAN to re-cluster
 */
function dbScanReclusterInner(
  node: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  clusters: Array<Array<LeafNode>> = [],
  noiseNodes: Array<LeafNode> = [],
  visitedNodes: { [key: string]: boolean } = {},
  nodeToClusterIndex: { [key: string]: number } = {},
  cluster: { cluster: Array<LeafNode>; currClusterIndex: number },
  minPts: number,
  minDist: number
) {
  console.log(
    `reCluster: ${clusters.length} clusters with the following sizes: ${clusters
      .map((c) => c.length)
      .join(',')}`
  );

  if (isLeafNode(node)) {
    console.log(`\n----Building cluster ${cluster.currClusterIndex}----\n`);

    reClusterInner(
      node,
      edges,
      clusters,
      visitedNodes,
      nodeToClusterIndex,
      cluster,
      noiseNodes,
      minPts,
      minDist
    );

    if (cluster.cluster.length === 0) {
      console.log(`No cluster formed with node ${node.id}`);
    } else {
      console.log(
        `\n----Finished building cluster ${cluster.currClusterIndex} with size of ${
          cluster?.cluster.length
        }-------\n ${cluster.cluster.map((c) => c.id).join('\n')}\n-----------`
      );
    }
    if (cluster.cluster.length > 0) {
      clusters.push(cluster.cluster);
      const nextCluster = addNewCluster(clusters);
      cluster.cluster = nextCluster.cluster;
      cluster.currClusterIndex = nextCluster.currClusterIndex;
    }
    // console.log('nodeToClusterIndex is ', nodeToClusterIndex);
  } else {
    node.children
      .sort((a, b) => {
        if (!edges[a.id] || !edges[b.id]) return 0;
        return edges[a.id].incoming.length - edges[b.id].incoming.length;
      })
      .forEach((child) => {
        dbScanReclusterInner(
          child,
          edges,
          clusters,
          noiseNodes,
          visitedNodes,
          nodeToClusterIndex,
          cluster,
          minPts,
          minDist
        );
      });
  }
}

function addNewCluster(clusters: Array<Array<LeafNode>>): {
  cluster: Array<LeafNode>;
  currClusterIndex: number;
} {
  const currClusterIndex = clusters.length;
  const cluster: {
    cluster: Array<LeafNode>;
    currClusterIndex: number;
  } = {
    cluster: [],
    currClusterIndex,
  };
  return cluster;
}

function reClusterInner(
  node: LeafNode,
  edges: GVEdgeMapping,
  clusters: Array<Array<LeafNode>>,
  visitedNodes: { [key: string]: boolean },
  nodeToClusterIndex: { [key: string]: number },
  currCluster: { cluster: Array<LeafNode>; currClusterIndex: number },
  noiseNodes: Array<LeafNode>,
  minPts: number,
  minDist: number
) {
  if (visitedNodes[node.id]) {
    //  console.log(`reClustering inner: ${node.id} already visited, returning early`);
    return;
  }

  // console.log(`reClusterInner: ${node.id}`);

  const currentNeighbors = edges[node.id];
  if (!currentNeighbors) return;

  const possibleConnections = [...currentNeighbors.incoming, ...currentNeighbors.outgoing];
  const suggestedNeighbors = getSuggestedNeighbors(
    node,
    possibleConnections,
    nodeToClusterIndex,
    currCluster.currClusterIndex,
    edges,
    minDist
  );

  //   console.log(
  //     `Suggested neighbors for ${node.id} is ${suggestedNeighbors.length} (${suggestedNeighbors
  //       .map((s) => s.id)
  //       .join(',')}) out of a possible ${
  //       possibleConnections.length
  //     } connections: (${possibleConnections
  //       .map((p) => `${p.node.id}:${p.dependencyWeight}`)
  //       .join(',')})`
  //   );

  if (suggestedNeighbors.length >= minPts) {
    // console.log(
    //   `Node ${node.id} is part of a neighborhood of ${suggestedNeighbors.length}, pushing onto curr Cluster index ${currCluster.currClusterIndex}`
    // );

    const isFirstNode = currCluster.cluster.length === 0;
    if (isFirstNode) {
      console.log(
        `Creating cluster ${currCluster.currClusterIndex} with main node ${
          node.id
        } and neighbors  (${suggestedNeighbors.map((c) => c.id).join(',')})`
      );
    } else {
      console.log(
        `Adding node ${node.id} to cluster ${currCluster.currClusterIndex} (${currCluster.cluster
          .map((c) => c.id)
          .join(',')})`
      );
    }

    addNodeToCluster(
      node,
      currCluster.cluster,
      nodeToClusterIndex,
      currCluster.currClusterIndex,
      noiseNodes
    );

    visitedNodes[node.id] = true;

    for (const neighborInE of suggestedNeighbors) {
      reClusterInner(
        neighborInE,
        edges,
        clusters,
        visitedNodes,
        nodeToClusterIndex,
        currCluster,
        noiseNodes,
        minPts,
        minDist
      );

      //   if (clearCluster) {
      //     console.log('Encountered a child that is noise, breaking cluster.');
      //     currCluster = addNewCluster(clusters);
      //     break;
      //   }
    }
    // For the first point in the cluster, add all the neighbors.
    if (isFirstNode) {
      suggestedNeighbors.forEach((neighbor) => {
        // console.log(
        //   `Adding ${neighbor.id} to cluster ${currCluster.currClusterIndex} (${currCluster.cluster
        //     .map((c) => c.id)
        //     .join(',')}) because it's a neighbor of first node ${node.id}`
        // );
        //console.log(`Adding neighbor's neighbors for ${node.id}'s neighbor of ${neighbor.id}`);
        addNodeToCluster(
          neighbor,
          currCluster.cluster,
          nodeToClusterIndex,
          currCluster.currClusterIndex,
          noiseNodes
        );
        visitedNodes[neighbor.id] = true;
      });
    }
  } else {
    //console.log(`Node ${node.id} is noise.`);
    noiseNodes.push(node);
    visitedNodes[node.id] = true;
  }
  return;
}

function getSuggestedNeighbors(
  node: LeafNode,
  currentNeighbors: Array<Edge>,
  nodeToClusterIndex: { [key: string]: number },
  currClusterIndex: number,
  edges: GVEdgeMapping,
  minDistance: number
): Array<LeafNode> {
  const newNeighbors: LeafNode[] = [];

  currentNeighbors.forEach((neighbor) => {
    const existsInOtherCluster = existsInAnotherCluster(
      neighbor.node,
      nodeToClusterIndex,
      currClusterIndex
    );
    if (existsInOtherCluster) return;

    const distance = getDistanceBetweenNodes(node, neighbor.node, edges);
    // The neighbor has to be "close" enough, and it also can't already exist in a different cluster.
    if (distance >= minDistance) {
      newNeighbors.push(neighbor.node);
    }
  });
  return newNeighbors;
}

function addNodeToCluster(
  node: LeafNode,
  cluster: Array<LeafNode>,
  nodeToClusterIndex: { [key: string]: number },
  currClusterIndex: number,
  noiseNodes: Array<LeafNode>
) {
  if (existsInAnotherCluster(node, nodeToClusterIndex, currClusterIndex)) {
    throw new Error(`Node ${node.id} already belongs in a cluster`);
  }

  if (nodeToClusterIndex[node.id] === currClusterIndex) {
    return;
  }

  const noiseNodeIndex = noiseNodes.findIndex((n) => n.id === node.id);
  if (noiseNodeIndex >= 0) {
    console.log(`Node ${node.id} is no longer noise. Adding to cluster ${currClusterIndex}`);
    noiseNodes.splice(noiseNodeIndex, 1);
  }
  cluster.push(node);
  nodeToClusterIndex[node.id] = currClusterIndex;
}

function getDistanceBetweenNodes(node1: LeafNode, node2: LeafNode, edges: GVEdgeMapping): number {
  const edge2 = edges[node2.id];
  const node2Connections = [...edge2.incoming, ...edge2.outgoing];

  const nodeNotMe = node2Connections.find((c) => c.node.id != node1.id);

  // If node1 is node2 only connection then they definitely belong together.
  if (nodeNotMe === undefined) return 99;

  const tightestOtherEdge = node2Connections.reduce((max, conn) => {
    return max.dependencyWeight > conn.dependencyWeight ? max : conn;
  }, nodeNotMe);
  const thisEdge = node2Connections.find((c) => c.node.id === node1.id);

  if (!thisEdge) throw new Error('NO edge found');

  //   console.log(
  //     `Distance between ${node1.id} and ${node2.id} is ${thisEdge.dependencyWeight} - ${tightestOtherEdge.dependencyWeight}`
  //   );
  return thisEdge.dependencyWeight - tightestOtherEdge.dependencyWeight;
}

function existsInAnotherCluster(
  node: LeafNode,
  nodeToClusterIndex: { [key: string]: number },
  currClusterIndex: number
) {
  const existsInACluster = nodeToClusterIndex[node.id] !== undefined;
  const existsInThisCluster = nodeToClusterIndex[node.id] === currClusterIndex;
  const existsInOtherCluster = existsInACluster && !existsInThisCluster;
  return existsInOtherCluster;
}
