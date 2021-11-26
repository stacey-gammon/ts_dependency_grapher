import { getSafeName } from './graph_vis/utils';
import { LeafNode, ParentNode, BaseNode } from './types';
import { getEmptyNodeCounts } from './utils';

export function getNode(filePath = 'foo'): LeafNode {
  return {
    ...getBaseNode(filePath),
    ...getEmptyNodeCounts(),
  };
}

export function getParentNode(filePath = 'foo'): ParentNode {
  return {
    ...getBaseNode(filePath),
    children: [],
  };
}

export function getBaseNode(filePath = 'foo'): BaseNode {
  return {
    id: getSafeName(filePath),
    label: filePath,
    filePath,
    ...getEmptyNodeCounts(),
  };
}
