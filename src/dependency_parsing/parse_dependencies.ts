import { Project, SourceFile } from 'ts-morph';
import Path from 'path';
import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { EntryInfo, RepoConfigSettings } from '../config/repo_config_settings';
import { getConfig } from '../config';
import { parseFiles } from './parse_files';

export function parseDependences({
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
  return parseFiles(files, repoRoot, repoInfo, getConfig().excludeFilePaths);
}
