import { getSafeName } from './graph_vis/utils';
import { LeafNode, ParentNode, BaseNode } from './types/types';
import { getEmptyNodeCounts } from './utils';

export function getNode(filePath = 'foo', parentNode?: ParentNode): LeafNode {
  return {
    ...getBaseNode(filePath, parentNode),
    ...getEmptyNodeCounts(),
  };
}

export function createAndAddLeafNode(filePath = 'foo', parentNode: ParentNode): LeafNode {
  const child = {
    ...getBaseNode(filePath, parentNode),
    ...getEmptyNodeCounts(),
  };
  parentNode.children.push(child);
  return child;
}

export function getParentNode(filePath = 'foo', parentNode?: ParentNode): ParentNode {
  return {
    ...getBaseNode(filePath, parentNode),
    children: [],
  };
}

export function getBaseNode(filePath = 'foo', parentNode?: ParentNode): BaseNode {
  return {
    id: getSafeName(filePath),
    label: filePath,
    filePath,
    parentNode,
    ...getEmptyNodeCounts(),
  };
}
