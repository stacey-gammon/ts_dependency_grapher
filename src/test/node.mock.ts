import { getSafeName } from '../grapher/graph_vis/utils';
import { LeafNode, ParentNode } from '../grapher/dependency_builder';
import { getEmptyNodeCounts } from '../utils';
import { ApiItemMap } from '../grapher/dependency_builder/types';

export function getLeafNode(
  filePath = 'foo',
  items: ApiItemMap,
  parentNode?: ParentNode
): LeafNode {
  return {
    ...getBaseNode(filePath, items, parentNode),
  };
}

export function createAndAddLeafNode(
  filePath = 'foo',
  items: ApiItemMap,
  parentNode: ParentNode
): LeafNode {
  const child = {
    ...getBaseNode(filePath, items, parentNode),
  };
  parentNode.children.push(child);
  return child;
}

export function getParentNode(
  filePath = 'foo',
  items: ApiItemMap,
  parentNode?: ParentNode
): ParentNode {
  return {
    ...getBaseNode(filePath, items, parentNode),
    children: [],
  };
}

export function getBaseNode(filePath = 'foo', items: ApiItemMap, parentNode?: ParentNode) {
  const apiItem = {
    id: getSafeName(filePath),
    label: filePath,
    filePath,
    ...getEmptyNodeCounts(),
  };
  items[apiItem.id] = apiItem;
  return {
    parentId: parentNode && parentNode.id,
    id: apiItem.id,
  };
}
