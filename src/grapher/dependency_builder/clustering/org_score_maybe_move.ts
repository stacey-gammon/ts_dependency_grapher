import {
  getDependencyWeightForParent,
  getTightestParentConnection,
} from '../stats/get_tightest_connection';
import { moveNode } from './move_node';
import { GVEdgeMapping } from '../types/edge_types';
import { LeafNode } from '../types/types';
import { isMoveWorthIt } from './is_move_worth_it';
import { Move } from './org_score_clustering';

export function maybeMove(
  node: LeafNode,
  allEdges: GVEdgeMapping,
  moveThreshold: number,
  movesMade: Array<Move>
): boolean {
  const nodeEdges = allEdges[node.id];
  const nodeParent = node.parentNode;
  if (!nodeEdges) return false;
  if (!nodeParent) return false;

  const edges = [...nodeEdges.incoming, ...nodeEdges.outgoing];

  const newParent = getTightestParentConnection(edges, nodeParent.id);
  if (!newParent) return false;

  const parentWeight = getDependencyWeightForParent(edges, nodeParent.id);

  const { isWorthIt, description } = isMoveWorthIt(
    node,
    newParent,
    edges,
    parentWeight,
    moveThreshold
  );

  // Given the last move, this move is now a no-op, to keep the tree even, stay with this parent before going on to next.
  if (isWorthIt) {
    console.log(`Moving ${node.id} to ${newParent.parentNode.id}`);
    movesMade.push({
      node: node.id,
      fromParent: nodeParent.id,
      toParent: newParent.parentNode.id,
      description,
    });
    moveNode(node, newParent.parentNode);
    return true;
  }
  return false;
}
