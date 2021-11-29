import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { rollupEdges } from './rollup_edges';
import { getEmptyNodeCounts } from '../utils';
import { NodeWithLeafChildren, NodeWithNonLeafChildren } from './types';
import { ConditionalExpression } from 'ts-morph';

export function zoomOut(node: ParentNode | LeafNode, edges: GVEdgeMapping, zoomLevel: number) {
  const oldLeafToNewLeaf: { [key: string]: LeafNode } = {};

  const zoomedOutRoot = zoomOutInner(node, edges, oldLeafToNewLeaf, 0, zoomLevel);

  const zoomedOutEdges = rollupEdges(edges, oldLeafToNewLeaf);

  return { zoomedOutEdges, zoomedOutRoot };
}

export function zoomOutInner(
  node: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  oldLeafToNewLeaf: { [key: string]: LeafNode },
  currDepth: number,
  maxDepth: number,
  parentIdToLeaf: { [key: string]: string[] } = {}
): LeafNode | ParentNode {
  if (isLeafNode(node)) {
    return node;
  } else if (currDepth < maxDepth && node.children.length > 0) {
    const children: Array<ParentNode | LeafNode> = node.children.map((child) =>
      zoomOutInner(child, edges, oldLeafToNewLeaf, currDepth + 1, maxDepth, parentIdToLeaf)
    );
    node.children = children;
    return node;
  } else if (currDepth >= maxDepth && !isLeafNode(node)) {
    return turnIntoLeafNode(node, oldLeafToNewLeaf, parentIdToLeaf);
  } else {
    return node;
    // console.log(node);
    // throw new Error('Failed to fall into expected return');
  }
}

function turnIntoLeafNode(
  node: ParentNode | LeafNode,
  oldLeafToNewLeaf: { [key: string]: LeafNode },
  parentIdToLeaf: { [key: string]: string[] }
): LeafNode {
  console.log(`turnIntoLeafNode: node id is ${node.id}`);

  if (isLeafNode(node)) {
    console.log('turnIntoLeafNode: is leaf node! returning self');
    return node;
  } else if (node.children.length === 0) {
    delete (node as any).children;
    return node as any as LeafNode;
  }

  if (nodeHasOnlyLeafChildren(node)) {
    return turnNodeWithLeafsIntoLeafNode(node, oldLeafToNewLeaf, parentIdToLeaf);
  } else if (nodeHasParentChildren(node)) {
    console.log(`Node has parent children, node id is ${node.id}`);
    const rolledUpChildren: Array<ParentNode | LeafNode> = [];
    node.children.forEach((child) => {
      const rolledUpChild = turnIntoLeafNode(child, oldLeafToNewLeaf, parentIdToLeaf);
      rolledUpChildren.push(rolledUpChild);
    });
    (node as ParentNode).children = rolledUpChildren;
    return turnIntoLeafNode(node, oldLeafToNewLeaf, parentIdToLeaf);
  }
  throw new Error('Shouldnt get here');
}

function turnNodeWithLeafsIntoLeafNode(
  node: NodeWithLeafChildren,
  oldLeafToNewLeaf: { [key: string]: LeafNode },
  parentIdToLeafs: { [key: string]: string[] }
): LeafNode {
  console.log(`turnNodeWithLeafsIntoLeafNode node id is ${node.id}`);

  const newLeaf: LeafNode = {
    ...node,
    ...getEmptyNodeCounts(),
    children: undefined,
  } as LeafNode;

  node.children.forEach((child) => {
    newLeaf.publicAPICount += child.publicAPICount;
    newLeaf.complexityScore += child.complexityScore;
    newLeaf.innerNodeCount += child.innerNodeCount;

    const leafs: string[] = parentIdToLeafs[child.id] || [child.id];
    leafs.forEach((leaf) => {
      oldLeafToNewLeaf[leaf] = newLeaf;
    });

    if (!parentIdToLeafs[node.id]) parentIdToLeafs[node.id] = [];

    parentIdToLeafs[node.id].push(...leafs);
  });

  return newLeaf;
}

export function nodeHasOnlyLeafChildren(node?: ParentNode): node is NodeWithLeafChildren {
  console.log('nodeHasOnlyLeafChildren');
  if (!node || node.children.length === 0) {
    return false;
  } else {
    for (const child of node.children) {
      if (!isLeafNode(child)) return false;
    }
    return true;
  }
}

function nodeHasParentChildren(
  node: NodeWithNonLeafChildren | ParentNode
): node is NodeWithNonLeafChildren {
  console.log('nodeHasParentChildren');

  if (!node || node.children.length === 0) {
    return false;
  } else {
    for (const child of node.children) {
      if (!isLeafNode(child)) return true;
    }
    return false;
  }
}

export function isLeafNode(node: LeafNode | ParentNode): node is LeafNode {
  return (node as ParentNode).children === undefined;
}
