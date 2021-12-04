import { SourceFile } from 'ts-morph';
import { RepoConfigSettings } from '../config/repo_config_settings';
import { GVEdgeMapping } from '../types/edge_types';
import { LeafNode, ParentNode } from '../types/types';
import { getEmptyNodeCounts } from '../utils';
import { addEdgesFromFiles } from './add_edges_from_files';
import { addNodesFromFiles } from './add_nodes_from_files';

export function parseFiles(
  files: SourceFile[],
  repoRoot: string,
  repoInfo: RepoConfigSettings,
  excludeFilesPaths?: Array<string>
): { edges: GVEdgeMapping; root: ParentNode | LeafNode } {
  const edges: GVEdgeMapping = {};

  const root: ParentNode = {
    filePath: '',
    id: 'root',
    label: 'root',
    children: [],
    ...getEmptyNodeCounts(),
  };

  addNodesFromFiles(root, repoRoot, files, excludeFilesPaths);
  addEdgesFromFiles(
    root,
    edges,
    files,
    repoRoot,
    !!repoInfo.showExternalNodesOnly,
    excludeFilesPaths
  );

  return { edges, root };
}
