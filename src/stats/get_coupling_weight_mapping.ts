import { BaseNode, GVEdgeMapping, ParentNode } from '../types';

/**
 * Map the destination key to each of it's incoming dependency source nodes, and how many times they
 * there is an edge between them.
 */
export interface CouplingWeightMapping {
  [node: string]: Array<{ parentNode: ParentNode; connectionWeight: number }>;
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

export function getCouplingWeightMapping(
  edges: GVEdgeMapping,
  stats: DependencyStatsMapping
): CouplingWeightMapping {
  const weights: CouplingWeightMapping = {};

  Object.keys(edges).forEach((sourceId) => {
    const source = edges[sourceId].source;
    // const sourceParent = source.parentNode;

    edges[sourceId].destinations.forEach(({ destinationNode, dependencyWeight }) => {
      // const destinationParent = destinationNode.parentNode;
      //   // We only care about intra connections. If this node is in the same parent, skip it.
      //   if (sourceParent && destinationParent && destinationParent.filePath === sourceParent.filePath)
      //     return;

      addConnection(weights, source, destinationNode, dependencyWeight, stats);
    });
  });

  //   console.log(
  //     'weights is' +
  //       JSON.stringify(
  //         weights,
  //         (key, val) => {
  //           return key === 'parentNode' ? val.parentNode?.id : val;
  //         },
  //         2
  //       )
  //   );
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
  weights: CouplingWeightMapping,
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
  weights: CouplingWeightMapping,
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
