import { Project, SourceFile } from 'ts-morph';
import Path from 'path';
import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { RepoInfo } from '../config/repo_config_settings';
import { getConfig } from '../config';
import { parseFiles } from './parse_files';
import glob from 'glob';

export function parseDependences({
  entries,
  repoInfo,
  project,
}: {
  repoInfo: RepoInfo;
  entries?: Array<string>;
  project: Project;
}): { edges: GVEdgeMapping; root: ParentNode | LeafNode } {
  let files: SourceFile[] = [];

  if (entries) {
    entries?.forEach((entry) => {
      const matches = glob.sync(entry);
      matches.forEach((match) => files.push(project.getSourceFileOrThrow(match)));
    });
  } else {
    files = project.getSourceFiles();
  }

  const repoRoot = Path.resolve(repoInfo.tsconfig, '..');
  return parseFiles(files, repoRoot, repoInfo, getConfig().excludeFilePaths);
}
