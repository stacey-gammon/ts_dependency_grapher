import { BaseNode, LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';

/**
 * Map the destination key to each of it's incoming dependency source nodes, and how many times they
 * there is an edge between them.
 */
export interface NodeToParentDependencies {
  [node: string]: Array<ParentConnection>;
}

export interface ParentConnection {
  parentNode: ParentNode;
  connectionWeight: number;
}

export interface DependencyStatsMapping {
  [key: string]: DependencyStats;
}

export interface DependencyStats {
  interDependencyCount: number;
  intraDependencyCount: number;
  efferentCoupling: number;
  afferentCoupling: number;
}

export function getParentConnections(
  node: LeafNode,
  edges: GVEdgeMapping
): Array<ParentConnection> {
  if (edges[node.id] === undefined) return [];

  const parentConnections: Array<ParentConnection> = [];
  edges[node.id].incoming.forEach((connection) => {
    if (connection.node.parentNode) {
      addParentConnection(
        parentConnections,
        connection.node.parentNode,
        connection.dependencyWeight
      );
    }
  });
  edges[node.id].outgoing.forEach((connection) => {
    if (connection.node.parentNode) {
      addParentConnection(
        parentConnections,
        connection.node.parentNode,
        connection.dependencyWeight
      );
    }
  });
  return parentConnections;
}

function addParentConnection(
  connections: Array<ParentConnection>,
  parentNode: ParentNode,
  connectionWeight: number
) {
  const existingConnection = connections.find((conn) => conn.parentNode.id === parentNode.id);

  if (existingConnection) {
    existingConnection.connectionWeight += connectionWeight;
  } else {
    connections.push({
      parentNode,
      connectionWeight,
    });
  }
}

export function getDependencyStats(
  edges: GVEdgeMapping,
  stats: DependencyStatsMapping
): NodeToParentDependencies {
  const weights: NodeToParentDependencies = {};

  Object.keys(edges).forEach((sourceId) => {
    const source = edges[sourceId].node;
    edges[sourceId].outgoing.forEach(({ node, dependencyWeight }) => {
      addConnection(weights, source, node, dependencyWeight, stats);
    });
  });
  return weights;
}

/**
 * Adds an entry for both source and dest ids, as direction of edge doesn't matter.
 * @param weights
 * @param source
 * @param dest
 * @param dependencyWeight
 */
function addConnection(
  weights: NodeToParentDependencies,
  source: BaseNode,
  dest: BaseNode,
  dependencyWeight: number,
  stats: DependencyStatsMapping
) {
  if (!dest.parentNode || !source.parentNode) return;

  if (!stats[dest.id]) {
    stats[dest.id] = {
      interDependencyCount: 0,
      intraDependencyCount: 0,
      efferentCoupling: 0,
      afferentCoupling: 0,
    };
  }

  if (!stats[source.id]) {
    stats[source.id] = {
      interDependencyCount: 0,
      intraDependencyCount: 0,
      efferentCoupling: 0,
      afferentCoupling: 0,
    };
  }

  const isInterDependency =
    source.parentNode && dest.parentNode && source.parentNode.id === dest.parentNode.id;
  if (isInterDependency) {
    stats[dest.id].interDependencyCount += dependencyWeight;
    stats[source.id].interDependencyCount += dependencyWeight;
  } else {
    stats[dest.id].intraDependencyCount += dependencyWeight;
    stats[source.id].intraDependencyCount += dependencyWeight;

    stats[dest.id].afferentCoupling += dependencyWeight;
    stats[source.id].efferentCoupling += dependencyWeight;
  }

  if (dest.parentNode) {
    addConnectionToParent(weights, source, dest.parentNode, dependencyWeight);
  }
  if (source.parentNode) {
    addConnectionToParent(weights, dest, source.parentNode, dependencyWeight);
  }
}

function addConnectionToParent(
  weights: NodeToParentDependencies,
  source: BaseNode,
  destinationParent: ParentNode,
  dependencyWeight: number
) {
  if (!weights[source.id]) {
    weights[source.id] = [];
  }

  const existingConnection = weights[source.id].find(
    (f) => f.parentNode && f.parentNode.id === destinationParent.id
  );

  if (!existingConnection) {
    weights[source.id].push({
      parentNode: destinationParent,
      connectionWeight: dependencyWeight,
    });
  } else if (existingConnection) {
    existingConnection.connectionWeight += dependencyWeight;
  }
}
