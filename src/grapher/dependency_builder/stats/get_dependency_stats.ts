import { Edge, GVEdgeMapping, LeafNode, ParentNode } from '../types';

/**
 * Map the destination key to each of it's incoming dependency source nodes, and how many times they
 * there is an edge between them.
 */
export interface NodeToParentDependencies {
  [node: string]: Array<ParentConnection>;
}

export interface ParentConnection {
  parentId: string;
  connectionWeight: number;
  childConnections: Array<Edge>;
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

export function fillDependencyStats(edges: GVEdgeMapping, stats: DependencyStatsMapping) {
  Object.keys(edges).forEach((edge) => {
    const source = edges[edge].node;
    // Only need to look at one direction, if we look at both we'll end up double
    // counting.
    edges[edge].outgoing.forEach(({ node, dependencyWeight }) => {
      getStatsForSourceAndDestNode(source, node, dependencyWeight, stats);
    });
  });
}

/**
 * Adds an entry for both source and dest ids, as direction of edge doesn't matter.
 * @param weights
 * @param source
 * @param dest
 * @param dependencyWeight
 */
function getStatsForSourceAndDestNode(
  source: LeafNode | ParentNode,
  dest: LeafNode | ParentNode,
  dependencyWeight: number,
  stats: DependencyStatsMapping
) {
  if (!dest.parentId || !source.parentId) return;

  if (!stats[dest.id]) {
    stats[dest.id] = initializeStats();
  }

  if (!stats[source.id]) {
    stats[source.id] = initializeStats();
  }

  const isInterDependency = source.parentId && dest.parentId && source.parentId === dest.parentId;
  if (isInterDependency) {
    stats[dest.id].interDependencyCount += dependencyWeight;
    stats[source.id].interDependencyCount += dependencyWeight;
  } else {
    stats[dest.id].intraDependencyCount += dependencyWeight;
    stats[source.id].intraDependencyCount += dependencyWeight;

    stats[dest.id].afferentCoupling += dependencyWeight;
    stats[source.id].efferentCoupling += dependencyWeight;
  }
}

const initializeStats = () => ({
  interDependencyCount: 0,
  intraDependencyCount: 0,
  efferentCoupling: 0,
  afferentCoupling: 0,
});
