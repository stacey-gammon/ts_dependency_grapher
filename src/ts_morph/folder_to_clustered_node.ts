import { getSafeName } from '../graph_vis/utils';
import { Folder, ParentNode } from '../types';

export function getClusteredNodeForFolder(folder: Folder): ParentNode {
  if (!folder.path) {
    throw new Error('getClusteredNodeForFolder has undefined path!');
  }
  if (!folder.name) {
    throw new Error('getClusteredNodeForFolder has undefined name!');
  }
  const cluster: ParentNode = {
    id: getSafeName(folder.path),
    label: folder.name,
    children: [],
  };

  const children: ParentNode[] = [];
  Object.values(folder.files).forEach((file) => {
    if (!file.path) {
      throw new Error('getClusteredNodeForFolder has undefined file.path!');
    }
    if (!file.name) {
      throw new Error('getClusteredNodeForFolder has undefined file.name!');
    }
    children.push({
      id: getSafeName(folder.path) + '_' + getSafeName(file.name),
      label: file.name,
      children: file.exports,
    });
  });
  cluster.children = children;

  const folderChildren: ParentNode[] = [];
  Object.values(folder.folders).forEach((subFolder) => {
    folderChildren.push(getClusteredNodeForFolder(subFolder));
  });
  cluster.children.push(...folderChildren);
  return cluster;
}
