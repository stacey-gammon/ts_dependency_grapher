import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { getLeafNodes } from './get_leaf_nodes';
import { getOrgScoreForNode } from '../stats/get_org_score_for_node';
import { maybeMove } from './org_score_maybe_move';
import nconf from 'nconf';

export interface Move {
  node: string;
  fromParent: string;
  toParent: string;
  description: string;
}

export function orgScoreClustering(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  movesMade: Array<Move>
) {
  const leafNodes = getLeafNodes(root);
  const leafNodesByParent = groupByParent(leafNodes);
  const MAX_ITERATIONS = 5;
  const visitedNodes: { [key: string]: boolean } = {};
  const moveThreshold = nconf.get('orgMoveThreshold') || 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let parentIds = Object.keys(leafNodesByParent);
    while (parentIds.length > 0) {
      parentIds.forEach((parentId) => {
        const nodesInParent = leafNodesByParent[parentId];
        // If we don't move any nodes out of this parent, keep trying until we run out of
        // children.
        let keepTakingForThisParent = true;
        while (keepTakingForThisParent) {
          const node = getNextNonVisitedNode(nodesInParent, visitedNodes);
          if (!node) {
            // No more nodes in this parent. Remove!
            delete leafNodesByParent[parentId];
            break;
          }
          const madeAMove = maybeMove(node, edges, moveThreshold, movesMade);
          visitedNodes[node.id] = true;
          keepTakingForThisParent = !madeAMove;
        }
      });
      parentIds = Object.keys(leafNodesByParent);
    }
    const totalOrgScore = leafNodes.reduce((s, n) => s + getOrgScoreForNode(n, edges).orgScore, 0);
    console.log(`${i}: Total org score: ${totalOrgScore} after ${movesMade.length} moves made`);
  }
}

function getNextNonVisitedNode(
  nodesInParent: Array<LeafNode>,
  visitedNodes: { [key: string]: boolean }
) {
  for (const node of nodesInParent) {
    if (!visitedNodes[node.id]) return node;
  }
  return undefined;
}

function groupByParent(nodes: Array<LeafNode>): { [key: string]: Array<LeafNode> } {
  const nodesByParent: { [key: string]: Array<LeafNode> } = {};

  nodes.forEach((node) => {
    const parentNode = node.parentNode;
    if (!parentNode) return;

    if (!nodesByParent[parentNode.id]) {
      nodesByParent[parentNode.id] = [];
    }
    nodesByParent[parentNode.id].push(node);
  });
  return nodesByParent;
}
