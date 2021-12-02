import { LeafNode, ParentNode } from '../types/types';
import { isLeafNode } from '../zoom/zoom_out';
import { NodeToParentDependencies, ParentConnection } from './get_dependency_stats';
import { getTightestParentConnection } from './get_tightest_connection';
import { getSumOfConnectionsExcept } from './get_sum_of_connections_except';
import { RecommendationsList } from './types';
import { isMoveWorthIt } from '../clustering/org_score_clustering';

export interface CoupledConnection {
  parentNode: ParentNode;
  connectionWeight: number;
}

export interface OrgScoreStats {
  connections: string;
  tightestConnectionParentId: string;
  tightestConnectionWeight: number;
  orgScore: number;
  intraDependencyCount: number;
  interDependencyCount: number;
}

export interface OrgScoreStatsMapping {
  [key: string]: OrgScoreStats;
}

export function fillOrgScoreStats(
  weights: NodeToParentDependencies,
  node: LeafNode | ParentNode,
  stats: OrgScoreStatsMapping,
  recommendations: RecommendationsList
) {
  if (isLeafNode(node)) {
    stats[node.id] = getOrgScoreStatsForNode(weights, node, recommendations);
  } else {
    node.children.forEach((child) => {
      fillOrgScoreStats(weights, child, stats, recommendations);
    });
  }
}

/**
 * Returns whether or not modifications were made and scores should be re-calculated
 * @param weights
 * @param node
 * @param depStats
 * @param nodeStats
 */
export function getOrgScoreStatsForNode(
  weights: NodeToParentDependencies,
  node: LeafNode,
  recommendations: RecommendationsList
): OrgScoreStats {
  const nodeParent = node.parentNode;
  if (!nodeParent || !weights[node.id])
    return {
      orgScore: 0,
      tightestConnectionParentId: '',
      tightestConnectionWeight: 0,
      connections: '',
      intraDependencyCount: 0,
      interDependencyCount: 0,
    };

  if (weights[node.id]) {
    const tightestConnection = getTightestParentConnection(weights[node.id]);
    if (!tightestConnection) throw new Error('tightestConnection Should be defined');

    const tigthestIntraConnection = getTightestParentConnection(weights[node.id], nodeParent.id);
    const interConnection = weights[node.id].find((conn) => conn.parentNode.id === nodeParent.id);
    const interConnectionWeight = interConnection ? interConnection.connectionWeight : 0;
    const orgScore = tigthestIntraConnection
      ? interConnectionWeight - tigthestIntraConnection.connectionWeight
      : interConnectionWeight;

    if (orgScore < 0) {
      if (!tigthestIntraConnection)
        throw new Error('Unexpected tightestconnection should not be undefined');

      if (isMoveWorthIt(tigthestIntraConnection, weights[node.id])) {
        fillRecommendation(node, tigthestIntraConnection, recommendations);
      }
    }

    return {
      connections: weights[node.id]
        .map((conn) => `[${conn.parentNode.id}:${conn.connectionWeight}]`)
        .join(','),
      tightestConnectionParentId: tightestConnection.parentNode.id,
      tightestConnectionWeight: tightestConnection.connectionWeight,
      orgScore,
      interDependencyCount: interConnection?.connectionWeight || 0,
      intraDependencyCount: getSumOfConnectionsExcept(weights[node.id], interConnection),
    };
  } else {
    // This can happen if a file has 0 exports.
    throw new Error(`Node ${node.id} needs to at least have a connection to it's own parent.`);
  }
}

function fillRecommendation(
  node: LeafNode,
  tighterConnection: ParentConnection,
  recommendations: RecommendationsList
) {
  recommendations.push({
    node,
    newParent: tighterConnection.parentNode,
  });
}
