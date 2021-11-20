import { ClusteredNode, GVEdgeMapping, GVNode, LeafNode, NodeWithLeafChildren, NodeWithNonLeafChildren, ParentNode } from './types';

export function zoomOut(
    node: ParentNode | LeafNode, 
    edges: GVEdgeMapping,
    leafToParentId: { [key: string]: string },
    parentIdToLeaf: { [key: string]: string[] },
    currDepth: number,
    maxDepth: number): ParentNode | LeafNode {
  if (isGVNode(node)) {
    return node;
  } else if (currDepth < maxDepth && node.children.length > 0) {
    const children: ParentNode[] | LeafNode[] = node.children.map(child => zoomOut(child, edges, leafToParentId, parentIdToLeaf, currDepth + 1, maxDepth)) as any;
    return {
      id: node.id,
      label: node.label,
      children
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
  parentIdToLeaf: { [key: string]: string[] }): LeafNode {
  if (node.children.length === 0) {
    return {
        id: node.id,
        label: node.label,
        incomingDependencyCount: 0,
        publicAPICount: 0
      };
  }

  if (nodeHasLeafChildren(node)) {
    return turnNodeWithLeafsIntoLeafNode(node, leafToParentId, parentIdToLeaf);
  } else if (nodeHasParentChildren(node)) {
    const rolledUpChildren: NodeWithLeafChildren[] = [];
    node.children.forEach(child => {
      const rolledUpChild = turnIntoLeafNode(child, leafToParentId, parentIdToLeaf);
      rolledUpChildren.push(rolledUpChild as any);
    });
    return turnIntoLeafNode({ ...node, children: rolledUpChildren }, leafToParentId, parentIdToLeaf);
  }
  throw new Error('Shouldnt get here');
}

function turnNodeWithLeafsIntoLeafNode(
  node: NodeWithLeafChildren,
  leafToParentId: { [key: string]: string },
  parentIdToLeafs: { [key: string]: string[] },): GVNode {
  console.log('turnNodeWithLeafsIntoLeafNode');
//  leafToParentId[node.id] = node.id;
  const { incomingDependencyCount, publicAPICount } = node.children.reduce((acc, child) => {
    if(child.incomingDependencyCount === undefined || child.incomingDependencyCount === NaN) {
      console.log('nongc node in arr',child);
      console.log('parent is ', node);
      throw new Error('non gc node in this array!');
    }
    acc.incomingDependencyCount += child.incomingDependencyCount;
    acc.publicAPICount += child.publicAPICount;

    const leafs: string[] = parentIdToLeafs[child.id] || [child.id];

    leafs.forEach(leaf => {
      console.log(`Adding leaf ${leaf} to parent id ${node.id}`);
      leafToParentId[leaf] = node.id;
    });

    if (!parentIdToLeafs[node.id]) parentIdToLeafs[node.id] = [];
    
    parentIdToLeafs[node.id].push(...leafs);
    return acc;
  }, { incomingDependencyCount: 0, publicAPICount: 0 } as { incomingDependencyCount: number, publicAPICount: number });

  return {
    id: node.id,
    label: node.label,
    incomingDependencyCount,
    publicAPICount,
  } as GVNode;
}

export function nodeHasLeafChildren(node?: ParentNode): node is NodeWithLeafChildren {
  return !!node && node.children.length > 0 && isGVNode(node.children[0]);
}

function nodeHasParentChildren(node: NodeWithNonLeafChildren | ParentNode): node is NodeWithNonLeafChildren {
  return !!node && node.children.length > 0 && !isGVNode(node.children[0]);
}

export function isGVNodeArray(node?: Array<GVNode> | Array<ClusteredNode>): node is Array<GVNode> {
  return !!node && node.length > 0 && isGVNode(node[0]);
}

export function isGVNode(node: GVNode | ClusteredNode): node is GVNode {
  return (node as ClusteredNode).children === undefined;
}
