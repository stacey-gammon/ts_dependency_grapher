import { LeafNode, ParentNode } from '../types';
import { getEmptyNodeCounts, getParentFolder } from '../../../utils';
import { isLeafNode } from '../utils';
import { getSafeName } from '../../graph_vis/utils';
import { ApiItem, ApiItemMap } from '../types/node_types';

/**
 *
 *
 *
 * @param filePath
 * @param node
 * @param complexityScore
 * @returns
 */
export function getOrCreateNode(
  filePath: string,
  node: ParentNode | LeafNode,
  complexityScore: number,
  apiItems: ApiItemMap
): LeafNode | ParentNode | undefined {
  const parentFolder = getParentFolder(filePath);

  if (apiItems[node.id] && apiItems[node.id].filePath === filePath) {
    return node;
  }

  // node = /src/bar and filePath: /src/foo/zed, no match and does not belong in chain.
  if (!filePath.startsWith(apiItems[node.id].filePath)) {
    return undefined;
  }

  // /root/src | /root
  if (apiItems[node.id].filePath === parentFolder) {
    const newChild: LeafNode = {
      id: getSafeName(filePath),
    };
    const apiItem: ApiItem = {
      filePath: filePath,
      label: filePath,
      ...node,
      ...getEmptyNodeCounts(),
      complexityScore,
    };
    apiItems[newChild.id] = apiItem;
    if (!(node as ParentNode).children) {
      // convert to parent node.
      (node as ParentNode).children = [newChild];
      newChild.parentId = node.id;

      return newChild;
    } else if (!isLeafNode(node)) {
      for (const child of node.children) {
        if (apiItems[child.id].filePath === filePath) return child;
      }
      newChild.parentId = node.id;
      node.children.push(newChild);
      return newChild;
    }
  }

  // /root/src/foo | /root
  if (filePath.startsWith(apiItems[node.id].filePath)) {
    // parentPath = /root/src, now will match above recursively.
    const found = getOrCreateNode(parentFolder, node, complexityScore, apiItems);

    if (found) {
      if (apiItems[node.id].filePath === filePath) return found;

      return getOrCreateNode(filePath, found, complexityScore, apiItems);
    }
  }
}

// path: root/src/foo/bar/zed, node: { path: root, children: [] }
// path: root/src/foo/bar
//
// path: root/src/foo
//    after: root: { path: root, children: [{ path: 'root/src' }] } } return { path: 'root/src' }
//         after: path: root/src/foo on { path: 'root/src' }, return
//
// path: root/src/, node: { path: root, children: [] }
//    after: root: { path: root, children: [{ path: 'root/src' }] } } return { path: 'root/src' }
//
// path: root, node: { path: root, children: [] }, return { path: root, children: [] }
