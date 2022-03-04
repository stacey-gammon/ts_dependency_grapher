import {
  getDependencyWeightForParent,
  getTightestParentConnection,
} from '../stats/get_tightest_connection';
import { moveNode } from './move_node';
import { LeafNode, GVEdgeMapping, ApiItemMap, ParentNode } from '../types';
import { isMoveWorthIt } from './is_move_worth_it';
import { Move } from './org_score_clustering';
import { findNodeWithId, isParentNode } from '../utils';

export function maybeMove(
  node: LeafNode,
  items: ApiItemMap,
  allEdges: GVEdgeMapping,
  moveThreshold: number,
  movesMade: Array<Move>,
  root: LeafNode | ParentNode
): boolean {
  const nodeEdges = allEdges[node.id];
  const nodeParentId = node.parentId;
  if (!nodeEdges) return false;
  if (!nodeParentId) return false;

  const edges = [...nodeEdges.incoming, ...nodeEdges.outgoing];

  const newParent = getTightestParentConnection(edges, nodeParentId);
  if (!newParent) return false;

  const parentWeight = getDependencyWeightForParent(edges, nodeParentId);

  const { isWorthIt, description } = isMoveWorthIt(
    node,
    items,
    newParent,
    edges,
    parentWeight,
    moveThreshold
  );

  // Given the last move, this move is now a no-op, to keep the tree even, stay with this parent before going on to next.
  if (isWorthIt) {
    const parentItem = items[newParent.parentId];
    const targetParentNode = findNodeWithId(root, newParent.parentId);
    if (!targetParentNode) {
      throw new Error(`Target parent with id ${newParent.parentId} not found in the tree`);
    }

    if (!isParentNode(targetParentNode)) {
      throw new Error('Target parent is not actually a parent!');
    }
    console.log(`Moving ${node.id} to ${targetParentNode.id}`);
    movesMade.push({
      node: node.id,
      fromParent: nodeParentId,
      toParent: parentItem.id,
      description,
    });
    moveNode(node, targetParentNode, root);
    return true;
  }
  return false;
}
