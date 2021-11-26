import {
  GVEdgeMapping,
  LeafNode,
  NodeWithLeafChildren,
  NodeWithNonLeafChildren,
  ParentNode,
} from '../types';
import { rollupEdges } from './rollup_edges';
import { getEmptyNodeCounts } from '../utils';

export function zoomOut(node: ParentNode | LeafNode, edges: GVEdgeMapping, zoomLevel: number) {
  const leafToParent: { [key: string]: ParentNode } = {};
  const parentIdToLeaf: { [key: string]: string[] } = {};

  const zoomedOutRoot = zoomOutInner(node, edges, leafToParent, parentIdToLeaf, 0, zoomLevel);

  const zoomedOutEdges = rollupEdges(edges, leafToParent);

  return { zoomedOutEdges, zoomedOutRoot };
}

export function zoomOutInner(
  node: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  leafToParent: { [key: string]: ParentNode },
  parentIdToLeaf: { [key: string]: string[] },
  currDepth: number,
  maxDepth: number
): LeafNode | ParentNode {
  if (isLeafNode(node)) {
    return node;
  } else if (currDepth < maxDepth && node.children.length > 0) {
    const children: Array<ParentNode | LeafNode> = node.children.map((child) =>
      zoomOutInner(child, edges, leafToParent, parentIdToLeaf, currDepth + 1, maxDepth)
    );
    return {
      ...node,
      children,
    };
  } else if (currDepth >= maxDepth && !isLeafNode(node)) {
    return turnIntoLeafNode(node, leafToParent, parentIdToLeaf);
  } else {
    return node;
    // console.log(node);
    // throw new Error('Failed to fall into expected return');
  }
}

function turnIntoLeafNode(
  node: ParentNode,
  leafToParent: { [key: string]: ParentNode },
  parentIdToLeaf: { [key: string]: string[] }
): LeafNode {
  console.log(`turnIntoLeafNode: node id is ${node.id}`);

  if (isLeafNode(node)) {
    console.log('turnIntoLeafNode: is leaf node! returning self');
    return node;
  } else if (node.children.length === 0) {
    return {
      ...node,
      ...getEmptyNodeCounts(),
      children: undefined,
      filePath: node.filePath,
    } as LeafNode;
  }

  if (nodeHasOnlyLeafChildren(node)) {
    return turnNodeWithLeafsIntoLeafNode(node, leafToParent, parentIdToLeaf);
  } else if (nodeHasParentChildren(node)) {
    console.log(`Node has parent children, node id is ${node.id}`);
    const rolledUpChildren: Array<ParentNode | LeafNode> = [];
    node.children.forEach((child) => {
      const rolledUpChild = turnIntoLeafNode(child, leafToParent, parentIdToLeaf);
      rolledUpChildren.push(rolledUpChild);
    });
    return turnIntoLeafNode({ ...node, children: rolledUpChildren }, leafToParent, parentIdToLeaf);
  }
  throw new Error('Shouldnt get here');
}

function turnNodeWithLeafsIntoLeafNode(
  node: NodeWithLeafChildren,
  leafToParent: { [key: string]: ParentNode },
  parentIdToLeafs: { [key: string]: string[] }
): LeafNode {
  console.log(`turnNodeWithLeafsIntoLeafNode node id is ${node.id}`);

  const { incomingDependencyCount, publicAPICount } = node.children.reduce(
    (acc, child) => {
      if (child.incomingDependencyCount === undefined || isNaN(child.incomingDependencyCount)) {
        throw new Error('non gc node in this array!');
      }
      acc.incomingDependencyCount += child.incomingDependencyCount;
      acc.publicAPICount += child.publicAPICount;

      const leafs: string[] = parentIdToLeafs[child.id] || [child.id];

      leafs.forEach((leaf) => {
        leafToParent[leaf] = node;
      });

      if (!parentIdToLeafs[node.id]) parentIdToLeafs[node.id] = [];

      parentIdToLeafs[node.id].push(...leafs);
      return acc;
    },
    { incomingDependencyCount: 0, publicAPICount: 0 } as {
      incomingDependencyCount: number;
      publicAPICount: number;
    }
  );

  return {
    ...node,
    ...getEmptyNodeCounts(),
    incomingDependencyCount,
    publicAPICount,
    innerNodeCount: node.children.reduce((sum, c) => (c.innerNodeCount || 1) + sum, 0),
    complexityScore: node.children.reduce((sum, c) => (c.complexityScore || 1) + sum, 0),
    children: undefined,
  } as LeafNode;
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
