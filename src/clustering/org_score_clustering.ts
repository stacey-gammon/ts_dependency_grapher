import { NodeStats } from '../types/node_stats';
import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { deCircularify } from '../utils';
import {
  getDependencyStats,
  getParentConnections,
  ParentConnection,
} from '../stats/get_dependency_stats';
import { fillOrgScoreStats, OrgScoreStatsMapping } from '../stats/get_org_score';
import { RecommendationsByParent, RecommendationsList } from '../stats/types';
import { getTightestParentConnection } from '../stats/get_tightest_connection';
import { getSumOfConnectionsExcept } from '../stats/get_sum_of_connections_except';
import { moveNode } from '../stats/move_node';

export function orgScoreClustering(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  recommendations: RecommendationsList
) {
  const MAX_ITERATIONS = 3;
  let iterations = 0;
  const orgStats: OrgScoreStatsMapping = {};
  const nodeStats: { [key: string]: NodeStats } = {};
  let dependencyStats = {};

  // Grouped by parent that has the node that should move. This is to help avoid one giant module. Do one move per parent at a time.
  while (iterations < MAX_ITERATIONS) {
    const totalOrgScore = Object.values(nodeStats).reduce((sum, stat) => stat.orgScore + sum, 0);
    console.log(
      `${iterations} Total org score: ${totalOrgScore} with ${
        Object.keys(recommendations).length
      } recommendations`
    );

    if (Object.keys(recommendations).length === 0) {
      console.log('No recommendations.');
      break;
    } else {
      const recsByParent = groupByParent(recommendations);
      const madeAChange = takeRecommendations(recsByParent, edges, recommendations);
      if (!madeAChange) break;
      iterations++;
    }

    dependencyStats = {};
    recommendations = [];
    const couplingWeights = getDependencyStats(edges, dependencyStats);
    fillOrgScoreStats(couplingWeights, root, orgStats, recommendations);
  }
}

function groupByParent(recommendations: RecommendationsList): RecommendationsByParent {
  const recommendationsByParent: RecommendationsByParent = {};

  recommendations.forEach((rec) => {
    if (!recommendationsByParent[rec.newParent.id]) {
      recommendationsByParent[rec.newParent.id] = [];
    }
    recommendationsByParent[rec.newParent.id].push(rec);
  });
  return recommendationsByParent;
}

export function takeRecommendations(
  recommendations: RecommendationsByParent,
  edges: GVEdgeMapping,
  actualRecommendations: RecommendationsList
): boolean {
  let madeAChange = false;
  const keys = Object.keys(recommendations);
  if (keys.length === 0) return madeAChange;

  //   console.log(
  //     'Initial list of recommendations are ',
  //     JSON.stringify(
  //       recommendations,
  //       (key, val) => {
  //         if (key === 'children') return 'kids';
  //         if (key === 'parentNode') return 'parent';
  //         return val;
  //       },
  //       2
  //     )
  //   );

  keys.forEach((key) => {
    let keepTakingForThisParent = true;
    while (keepTakingForThisParent) {
      if (recommendations[key].length === 0) {
        delete recommendations[key];
        keepTakingForThisParent = false;
        break;
      }

      const recommendation = recommendations[key][0];
      const parentConnections = getParentConnections(recommendation.node, edges);
      if (parentConnections.length > 0) {
        const newParent = getTightestParentConnection(parentConnections);

        if (!newParent) break;

        const isWorthIt = isMoveWorthIt(newParent, parentConnections);

        recommendations[key].splice(0, 1);

        // Given the last move, this move is now a no-op, to keep the tree even, stay with this parent before going on to next.
        if (isWorthIt && newParent.parentNode.id !== recommendation.node.parentNode?.id) {
          console.log(`Moving ${recommendation.node.id} to ${newParent.parentNode.id}`);
          actualRecommendations.push(recommendation);
          moveNode(recommendation.node, newParent.parentNode);
          console.log(
            `Recommendation taken: ${recommendation.node.id}'s connection with ${
              newParent.parentNode.id
            } with a weight of ${
              newParent.connectionWeight
            } was worth it compared to total dependency score of ${getSumOfConnectionsExcept(
              parentConnections,
              newParent
            )}`,
            JSON.stringify(parentConnections, deCircularify, 2)
          );
          madeAChange = true;
          keepTakingForThisParent = false;
          break;
        } else if (!isWorthIt) {
          console.log(
            `Recommendation skipped: ${recommendation.node.id}'s connection with ${
              newParent.parentNode.id
            } with a weight of ${
              newParent.connectionWeight
            } was not worth it compared to total dependency score of ${getSumOfConnectionsExcept(
              parentConnections,
              newParent
            )}`,
            JSON.stringify(parentConnections, deCircularify, 2)
          );
        }
      } else {
        keepTakingForThisParent = false;
        break;
      }
    }
  });
  return madeAChange;
}

/**
 * Moving a node needs to be worth it, as movement come with a cost. Plus, this is a computer recommending it, not a person, so it should
 * be significant enough, to avoid movements that don't provide enough benefit. For example, common utility types may have 0 inter-dependencies
 * but many intra-dependencies. Moving the node from one to another parent will incur a refactoring cost for all other intra-dependencies. We want
 * to avoid that.
 * @param newParent
 * @param allConnections
 */
export function isMoveWorthIt(newParent: ParentConnection, allConnections: ParentConnection[]) {
  const newParentDepWeight = newParent.connectionWeight;

  const sumOfOtherConnections = getSumOfConnectionsExcept(allConnections, newParent);

  return newParentDepWeight > sumOfOtherConnections;
}
