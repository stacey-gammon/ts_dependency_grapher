import { Project, SourceFile } from 'ts-morph';
import Path from 'path';
import { LeafNode, ParentNode, GVEdgeMapping } from '../types';
import { RepoConfig } from '../../../config/repo_config';
import { getConfig } from '../../../config';
import { parseFiles } from './parse_files';
import glob from 'glob';
import { ApiItemMap } from '../types/node_types';

export function parseDependencies({
  entries,
  repoInfo,
  project,
}: {
  repoInfo: RepoConfig;
  entries?: Array<string>;
  project: Project;
}): { edges: GVEdgeMapping; root: ParentNode | LeafNode; items: ApiItemMap } {
  let files: SourceFile[] = [];

  if (entries) {
    entries?.forEach((entry) => {
      const matches = glob.sync(entry);
      matches.forEach((match) => files.push(project.getSourceFileOrThrow(match)));
    });
  } else {
    files = project.getSourceFiles();
  }

  const rootDirs = project.getRootDirectories();
  if (rootDirs.length === 0) {
    throw new Error('No root directories found for project.');
  }
  const repoRoot = Path.resolve(rootDirs[0].getPath(), '..');

  return parseFiles(files, repoRoot, repoInfo, getConfig().excludeFilePaths);
}
