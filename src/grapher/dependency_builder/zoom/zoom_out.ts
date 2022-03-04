import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { rollupEdges } from './rollup_edges';
import { getEmptyNodeCounts } from '../../../utils';
import { NodeWithLeafChildren, NodeWithNonLeafChildren } from './types';
import { isLeafNode } from '..';
import { ApiItem, ApiItemMap } from '../types/node_types';
import { isParentNode } from '../utils';

export function zoomOut(
  node: ParentNode | LeafNode,
  items: ApiItemMap,
  edges: GVEdgeMapping,
  zoomLevel: number
) {
  const oldLeafToNewLeaf: { [key: string]: ApiItem } = {};

  const zoomedOutRoot = zoomOutInner(node, items, edges, oldLeafToNewLeaf, 0, zoomLevel);

  const zoomedOutEdges = rollupEdges(edges, oldLeafToNewLeaf);

  return { zoomedOutEdges, zoomedOutRoot };
}

export function zoomOutInner(
  node: ParentNode | LeafNode,
  items: ApiItemMap,
  edges: GVEdgeMapping,
  oldLeafToNewLeaf: { [key: string]: ApiItem },
  currDepth: number,
  maxDepth: number,
  parentIdToLeaf: { [key: string]: string[] } = {}
): LeafNode | ParentNode {
  if (!isParentNode(node)) {
    return node;
  } else if (currDepth < maxDepth && node.children.length > 0) {
    const children: Array<ParentNode | LeafNode> = node.children.map((child) =>
      zoomOutInner(child, items, edges, oldLeafToNewLeaf, currDepth + 1, maxDepth, parentIdToLeaf)
    );
    node.children = children;
    return node;
  } else if (currDepth >= maxDepth && !isLeafNode(node)) {
    return turnIntoLeafNode(node, items, oldLeafToNewLeaf, parentIdToLeaf);
  } else {
    return node;
  }
}

function turnIntoLeafNode(
  node: ParentNode | LeafNode,
  items: ApiItemMap,
  oldLeafToNewLeaf: { [key: string]: ApiItem },
  parentIdToLeaf: { [key: string]: string[] }
): LeafNode {
  if (!isParentNode(node)) {
    return node;
  } else if (node.children.length === 0) {
    delete (node as any).children;
    return node as any as LeafNode;
  }

  if (nodeHasParentChildren(node)) {
    const rolledUpChildren: Array<ParentNode | LeafNode> = [];
    node.children.forEach((child) => {
      const rolledUpChild = turnIntoLeafNode(child, items, oldLeafToNewLeaf, parentIdToLeaf);
      rolledUpChildren.push(rolledUpChild);
    });
    (node as ParentNode).children = rolledUpChildren;
    return turnIntoLeafNode(node, items, oldLeafToNewLeaf, parentIdToLeaf);
  } else if (nodeHasOnlyLeafChildren(node)) {
    return turnNodeWithLeafsIntoLeafNode(node, items, oldLeafToNewLeaf, parentIdToLeaf);
  }
  throw new Error('Shouldnt get here');
}

function turnNodeWithLeafsIntoLeafNode(
  node: NodeWithLeafChildren,
  items: ApiItemMap,
  oldLeafToNewLeaf: { [key: string]: ApiItem },
  parentIdToLeafs: { [key: string]: string[] }
): LeafNode {
  const newItem: ApiItem = {
    ...items[node.id],
    ...getEmptyNodeCounts(),
  } as ApiItem;

  node.children.forEach((child) => {
    const childItem = items[child.id];
    newItem.publicAPICount += childItem.publicAPICount;
    newItem.complexityScore += childItem.complexityScore;
    newItem.innerNodeCount += childItem.innerNodeCount;

    const leafs: string[] = parentIdToLeafs[child.id] || [child.id];
    leafs.forEach((leaf) => {
      oldLeafToNewLeaf[leaf] = newItem;
    });

    if (!parentIdToLeafs[node.id]) parentIdToLeafs[node.id] = [];

    parentIdToLeafs[node.id].push(...leafs);
  });

  return newItem;
}

export function nodeHasOnlyLeafChildren(node?: ParentNode): node is NodeWithLeafChildren {
  if (!node || node.children.length === 0) {
    return false;
  } else {
    for (const child of node.children) {
      if (isParentNode(child)) return false;
    }
    return true;
  }
}

function nodeHasParentChildren(
  node: NodeWithNonLeafChildren | ParentNode
): node is NodeWithNonLeafChildren {
  if (!node || node.children.length === 0) {
    return false;
  } else {
    for (const child of node.children) {
      if (isParentNode(child)) return true;
    }
    return false;
  }
}
