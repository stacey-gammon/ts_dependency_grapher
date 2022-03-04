import { ApiItemMap, GVEdgeMapping, LeafNode } from '../types';
import { OrgScoreStats } from './fill_org_score_stats';
import { getSumOfConnections } from './get_sum_of_connections';
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
export function getOrgScoreForNode(
  node: LeafNode,
  items: ApiItemMap,
  allEdges: GVEdgeMapping
): OrgScoreStats {
  const parentId = node.parentId;
  if (!parentId || !allEdges[node.id]) {
    return getEmptyCounts();
  }
  const nodeEdges = allEdges[node.id];
  const edges = [...nodeEdges.incoming, ...nodeEdges.outgoing];

  const tightestConnection = getTightestParentConnection(edges);
  if (!tightestConnection) {
    console.warn(`tightestConnection was not defined with edges ${edges.length}`);
    return getEmptyCounts();
  }

  const tightestIntraConnection = getTightestParentConnection(edges, parentId);
  const interConnectionWeight = getDependencyWeightForParent(edges, parentId);

  const orgScore = tightestIntraConnection
    ? interConnectionWeight - tightestIntraConnection.connectionWeight
    : interConnectionWeight;

  return {
    connections: edges
      .map((e) => `[${e.node.parentId}:${e.node.id}:${e.dependencyWeight}]`)
      .join(','),
    tightestConnectionParentId: tightestConnection.parentId,
    tightestConnectionWeight: tightestConnection.connectionWeight,
    orgScore,
    interDependencyCount: interConnectionWeight,
    intraDependencyCount: getSumOfConnections(edges, items, parentId),
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
