import { ParentConnection } from '../stats/get_dependency_stats';
import { getSumOfConnections } from '../stats/get_sum_of_connections';
import { Edge } from '../types/edge_types';
import { LeafNode } from '../types/types';
import { groupEdgesByParent } from './group_edges_by_parent';

/**
 * Moving a node needs to be worth it, as movement come with a cost. Plus, this is a computer recommending it, not a person, so it should
 * be significant enough, to avoid movements that don't provide enough benefit. For example, common utility types may have 0 inter-dependencies
 * but many intra-dependencies. Moving the node from one to another parent will incur a refactoring cost for all other intra-dependencies. We want
 * to avoid that.
 * @param newParent
 * @param allConnections
 */
export function isMoveWorthIt(
  node: LeafNode,
  newParent: ParentConnection,
  edges: Array<Edge>,
  currentParentWeight: number,
  moveThreshold: number
) {
  const origParent = node.parentNode;
  if (!origParent) return { isWorthIt: false, description: 'Node has no parent' };

  const edgesByParent = groupEdgesByParent(edges);

  // If this node has no connection with it's own parent and only has a connection with one
  // other parent, move it there. We don't automatically move if it has connections with multiple parents
  // as this is common for utility types and they are sometimes best pulled out.
  if (currentParentWeight === 0 && Object.keys(edgesByParent).length === 1) {
    return {
      isWorthIt: true,
      description: `Node's only connections are with nodes within ${newParent.parentNode.id}.`,
    };
  }

  const newParentDepWeight = newParent.connectionWeight;
  if (currentParentWeight > newParentDepWeight) {
    return { isMoveWorthIt: false, description: 'Strong connection with current parent' };
  }

  const sumOfOtherConnections = getSumOfConnections(edges, newParent.parentNode.id);
  let otherConnectionsDescription = '';
  let newParentConnectionsDescription = '';

  edges.forEach((edge) => {
    if (edge.node.parentNode && edge.node.parentNode.id != newParent.parentNode.id) {
      otherConnectionsDescription += `(${edge.node.parentNode.id}:${edge.node.id}:${edge.dependencyWeight})`;
    } else if (edge.node.parentNode) {
      newParentConnectionsDescription += `(${edge.node.parentNode.id}:${edge.node.id}:${edge.dependencyWeight})`;
    }
  });

  const veryTightConnectionToIt = newParentDepWeight - sumOfOtherConnections > moveThreshold;
  const description =
    `Connections with new parent, ${newParentConnectionsDescription}, is strong than with current parent (${currentParentWeight}), and subtracting the sum of all other parent connections, ${otherConnectionsDescription}, ${
      veryTightConnectionToIt ? 'exceeds' : 'does not exceed'
    } ` +
    `move threshold of ${moveThreshold}. ${newParentDepWeight} - ${sumOfOtherConnections} > ${moveThreshold}`;
  if (veryTightConnectionToIt) {
    console.log(
      `Moving node from ${origParent.id} to ${newParent.parentNode.id} because ${newParentDepWeight} - ${sumOfOtherConnections} > ${moveThreshold}`
    );
  }
  return { isWorthIt: veryTightConnectionToIt, description };
}
