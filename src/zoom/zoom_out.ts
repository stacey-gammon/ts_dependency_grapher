import { collectNodeCouplingWeights } from './coupling_weights';
import {
  ClusteredNode,
  GVEdgeMapping,
  CodeChunkNode,
  LeafNode,
  NodeWithLeafChildren,
  NodeWithNonLeafChildren,
  ParentNode,
} from '../types';
import { rollupEdges } from './rollup_edges';

export function zoomOut(node: ParentNode | LeafNode, edges: GVEdgeMapping, zoomLevel: number) {
  const leafToParentId: { [key: string]: string } = {};
  const parentIdToLeaf: { [key: string]: string[] } = {};

  const zoomedOutRoot = zoomOutInner(node, edges, leafToParentId, parentIdToLeaf, 0, zoomLevel);
  const zoomedOutEdges = rollupEdges(edges, leafToParentId, zoomedOutRoot);

  collectNodeCouplingWeights(zoomedOutEdges, zoomedOutRoot);

  return { zoomedOutEdges, zoomedOutRoot };
}

export function zoomOutInner(
  node: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  leafToParentId: { [key: string]: string },
  parentIdToLeaf: { [key: string]: string[] },
  currDepth: number,
  maxDepth: number
): LeafNode | ParentNode {
  if (isGVNode(node)) {
    return node;
  } else if (currDepth < maxDepth && node.children.length > 0) {
    const children: ParentNode[] | LeafNode[] = node.children.map((child) =>
      zoomOutInner(child, edges, leafToParentId, parentIdToLeaf, currDepth + 1, maxDepth)
    ) as any;
    return {
      id: node.id,
      label: node.label,
      children,
    } as any;
  } else if (currDepth >= maxDepth && !isGVNode(node)) {
    return turnIntoLeafNode(node, leafToParentId, parentIdToLeaf);
  } else {
    return node;
    // console.log(node);
    // throw new Error('Failed to fall into expected return');
  }
}

function turnIntoLeafNode(
  node: ParentNode,
  leafToParentId: { [key: string]: string },
  parentIdToLeaf: { [key: string]: string[] }
): LeafNode {
  if (node.children.length === 0) {
    return {
      id: node.id,
      label: node.label,
      incomingDependencyCount: 0,
      publicAPICount: 0,
      innerNodeCount: 0,
      maxSingleCoupleWeight: 0,
      complexityScore: 0,
      innerDependencyCount: 0, // This will be calculated later when the edges are rolled up
    };
  }

  if (nodeHasLeafChildren(node)) {
    return turnNodeWithLeafsIntoLeafNode(node, leafToParentId, parentIdToLeaf);
  } else if (nodeHasParentChildren(node)) {
    const rolledUpChildren: NodeWithLeafChildren[] = [];
    node.children.forEach((child) => {
      const rolledUpChild = turnIntoLeafNode(child, leafToParentId, parentIdToLeaf);
      rolledUpChildren.push(rolledUpChild as any);
    });
    return turnIntoLeafNode(
      { ...node, children: rolledUpChildren },
      leafToParentId,
      parentIdToLeaf
    );
  }
  throw new Error('Shouldnt get here');
}

function turnNodeWithLeafsIntoLeafNode(
  node: NodeWithLeafChildren,
  leafToParentId: { [key: string]: string },
  parentIdToLeafs: { [key: string]: string[] }
): CodeChunkNode {
  const { incomingDependencyCount, publicAPICount } = node.children.reduce(
    (acc, child) => {
      if (child.incomingDependencyCount === undefined || isNaN(child.incomingDependencyCount)) {
        throw new Error('non gc node in this array!');
      }
      acc.incomingDependencyCount += child.incomingDependencyCount;
      acc.publicAPICount += child.publicAPICount;

      const leafs: string[] = parentIdToLeafs[child.id] || [child.id];

      leafs.forEach((leaf) => {
        leafToParentId[leaf] = node.id;
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
    id: node.id,
    label: node.label,
    incomingDependencyCount,
    maxSingleCoupleWeight: 0,
    publicAPICount,
    innerNodeCount: node.children.reduce((sum, c) => (c.innerNodeCount || 1) + sum, 0),
    innerNodeConnections: 0,
    innerDependencyCount: 0,
    complexityScore: node.children.reduce((sum, c) => (c.complexityScore || 1) + sum, 0),
  } as CodeChunkNode;
}

export function nodeHasLeafChildren(node?: ParentNode): node is NodeWithLeafChildren {
  return !!node && node.children.length > 0 && isGVNode(node.children[0]);
}

function nodeHasParentChildren(
  node: NodeWithNonLeafChildren | ParentNode
): node is NodeWithNonLeafChildren {
  return !!node && node.children.length > 0 && !isGVNode(node.children[0]);
}

export function isGVNodeArray(
  node?: Array<CodeChunkNode> | Array<ParentNode>
): node is Array<CodeChunkNode> {
  return !!node && node.length > 0 && isGVNode(node[0]);
}

export function isGVNode(node: LeafNode | ParentNode): node is LeafNode {
  return (node as ClusteredNode).children === undefined;
}
