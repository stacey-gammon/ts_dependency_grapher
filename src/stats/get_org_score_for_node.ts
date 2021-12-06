import { GVEdgeMapping } from '../types/edge_types';
import { LeafNode } from '../types/types';
import { OrgScoreStats } from './fill_org_score_stats';
import { getSumOfConnections } from './get_sum_of_connections_except';
import {
  getDependencyWeightForParent,
  getTightestParentConnection,
} from './get_tightest_connection';

/**
 * Returns whether or not modifications were made and scores should be re-calculated
 * @param weights
 * @param node
 * @param depStats
 * @param nodeStats
 */
export function getOrgScoreForNode(node: LeafNode, allEdges: GVEdgeMapping): OrgScoreStats {
  const nodeParent = node.parentNode;
  if (!nodeParent || !allEdges[node.id]) {
    return getEmptyCounts();
  }
  const nodeEdges = allEdges[node.id];
  const edges = [...nodeEdges.incoming, ...nodeEdges.outgoing];

  const tightestConnection = getTightestParentConnection(edges);
  if (!tightestConnection) {
    console.warn(`tightestConnection was not defined with edges ${edges.length}`);
    return getEmptyCounts();
  }

  const tightestIntraConnection = getTightestParentConnection(edges, nodeParent.id);
  const interConnectionWeight = getDependencyWeightForParent(edges, nodeParent.id);

  const orgScore = tightestIntraConnection
    ? interConnectionWeight - tightestIntraConnection.connectionWeight
    : interConnectionWeight;

  return {
    connections: edges
      .map((e) => `[${e.node.parentNode?.id}:${e.node.id}:${e.dependencyWeight}]`)
      .join(','),
    tightestConnectionParentId: tightestConnection.parentNode.id,
    tightestConnectionWeight: tightestConnection.connectionWeight,
    orgScore,
    interDependencyCount: interConnectionWeight,
    intraDependencyCount: getSumOfConnections(edges, nodeParent.id),
  };
}

function getEmptyCounts() {
  return {
    orgScore: 0,
    tightestConnectionParentId: '',
    tightestConnectionWeight: 0,
    connections: '',
    intraDependencyCount: 0,
    interDependencyCount: 0,
  };
}
