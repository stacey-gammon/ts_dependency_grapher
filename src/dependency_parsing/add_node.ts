import { LeafNode, ParentNode } from '../types';
import { getEmptyNodeCounts, getParentFolder } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';
import { getSafeName } from '../graph_vis/utils';

export function addNode(
  filePath: string,
  node: ParentNode | LeafNode
): LeafNode | ParentNode | undefined {
  const parentFolder = getParentFolder(filePath);

  if (node.filePath === filePath) {
    return node;
  }

  // node = /src/bar and filePath: /src/foo/zed, no match and does not belong in chain.
  if (!filePath.startsWith(node.filePath)) {
    return undefined;
  }

  // /root/src | /root
  if (node.filePath === parentFolder) {
    const newChild: LeafNode = {
      filePath: filePath,
      label: filePath,
      id: getSafeName(filePath),
      ...getEmptyNodeCounts(),
    };
    if (!(node as ParentNode).children) {
      // convert to parent node.
      (node as ParentNode).children = [newChild];
      return newChild;
    } else if (!isLeafNode(node)) {
      for (const child of node.children) {
        if (child.filePath === filePath) return child;
      }
      node.children.push(newChild);
      return newChild;
    }
  }

  // /root/src/foo | /root
  if (filePath.startsWith(node.filePath)) {
    // parentPath = /root/src, now will match above recursively.
    const found = addNode(parentFolder, node);

    if (found) {
      if (found.filePath === filePath) return found;

      return addNode(filePath, found);
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
