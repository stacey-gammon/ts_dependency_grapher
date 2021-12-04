import { Project, SourceFile } from 'ts-morph';
import Path from 'path';
import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import nconf from 'nconf';
import { getEmptyNodeCounts } from '../utils';
import { EntryInfo, RepoConfigSettings } from '../config/repo_config_settings';
import { addNodesFromFiles } from './add_nodes_from_files';
import { addEdgesFromFiles } from './add_edges_from_files';

export function parseDependencies({
  entry,
  repoInfo,
  project,
}: {
  repoInfo: RepoConfigSettings;
  entry?: EntryInfo;
  project: Project;
}): { edges: GVEdgeMapping; root: ParentNode | LeafNode } {
  const files: SourceFile[] = entry
    ? [project.getSourceFileOrThrow(entry.file)]
    : project.getSourceFiles();

  const repoRoot = Path.resolve(repoInfo.tsconfig, '..');

  nconf.set('REPO_ROOT', repoRoot);

  const { edges, root } = parseFiles(files, repoRoot, repoInfo);

  return { edges, root };
}

export function parseFiles(
  files: SourceFile[],
  repoRoot: string,
  repoInfo: RepoConfigSettings
): { edges: GVEdgeMapping; root: ParentNode | LeafNode } {
  const edges: GVEdgeMapping = {};

  const root: ParentNode = {
    filePath: '',
    id: 'root',
    label: 'root',
    children: [],
    ...getEmptyNodeCounts(),
  };

  const excludeFilesPaths = nconf.get('excludeFilePaths');

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
