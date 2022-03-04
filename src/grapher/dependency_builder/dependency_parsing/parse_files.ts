import { SourceFile } from 'ts-morph';
import { RepoConfig } from '../../../config/repo_config';
import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { getEmptyNodeCounts } from '../../../utils';
import { addEdgesFromFiles } from './add_edges_from_files';
import { addNodesFromFiles } from './add_nodes_from_files';
import { ApiItem, ApiItemMap } from '../types/node_types';

export function parseFiles(
  files: SourceFile[],
  repoRoot: string,
  repoInfo: RepoConfig,
  excludeFilesPaths?: Array<string>
): { edges: GVEdgeMapping; root: ParentNode | LeafNode; items: ApiItemMap } {
  const edges: GVEdgeMapping = {};
  const items: ApiItemMap = {};

  const root: ApiItem = {
    filePath: '',
    id: 'root',
    label: 'root',
    ...getEmptyNodeCounts(),
  };

  const rootNode: ParentNode = {
    id: 'root',
    children: [],
  };

  addNodesFromFiles(rootNode, repoRoot, files, items, excludeFilesPaths);
  addEdgesFromFiles(
    root,
    edges,
    items,
    files,
    repoRoot,
    !!repoInfo.showExternalNodesOnly,
    excludeFilesPaths
  );

  return { edges, root, items };
}
