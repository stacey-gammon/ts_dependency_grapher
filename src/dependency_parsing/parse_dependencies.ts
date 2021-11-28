import { ClassDeclaration, InterfaceDeclaration, Project, SourceFile } from 'ts-morph';
import Path from 'path';
import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import nconf from 'nconf';
import fs from 'fs';
import os from 'os';
import { excludeFile, getEmptyNodeCounts, getRootRelativePath } from '../utils';
import { addEdges } from './add_edges';
import { addNode } from './add_node';

export function parseDependencies({
  entry,
  tsconfig,
  repo,
  outputNameForCache,
  refresh,
}: {
  repo: string;
  entry?: string;
  outputNameForCache?: string;
  tsconfig: string;
  refresh: boolean;
}): { edges: GVEdgeMapping; root: ParentNode | LeafNode } {
  const project = new Project({ tsConfigFilePath: tsconfig });
  project.resolveSourceFileDependencies();

  const files: SourceFile[] = entry
    ? [project.getSourceFileOrThrow(entry)]
    : project.getSourceFiles();

  const repoRoot = Path.resolve(tsconfig, '..');

  nconf.set('REPO_ROOT', repoRoot);

  const { edges, root } = parseFiles(files, repoRoot, repo, refresh, outputNameForCache);

  return { edges, root };
}

export function parseFiles(
  files: SourceFile[],
  repoRoot: string,
  repo: string,
  refresh: boolean,
  outputNameForCache?: string
): { edges: GVEdgeMapping; root: ParentNode | LeafNode } {
  const parsedRepoFilePathCache = outputNameForCache
    ? Path.resolve(os.tmpdir(), outputNameForCache.replace('/', '_') + 'ParsedRepo.json')
    : undefined;

  if (
    parsedRepoFilePathCache &&
    !refresh &&
    fs.existsSync(parsedRepoFilePathCache) &&
    !nconf.get('refreshParsing') &&
    !nconf.get('refresh')
  ) {
    console.log(`Parsed info for ${repo} is cached.`);
    const { root, edges } = JSON.parse(
      fs.readFileSync(parsedRepoFilePathCache, { encoding: 'utf-8' })
    );
    if (!root || !edges || typeof edges !== 'object' || typeof root != 'object') {
      fs.rmSync(parsedRepoFilePathCache);
      throw new Error(`Parsed repo cache for ${repo} contains unexpected data. Deleting cache.`);
    }
    return { edges, root };
  }
  console.log(`Parsed info for ${repo} is not cached.`);
  const edges: GVEdgeMapping = {};

  const root: ParentNode = {
    filePath: '',
    id: 'root',
    label: 'root',
    children: [],
    ...getEmptyNodeCounts(),
  };

  files.forEach((file) => {
    if (!excludeFile(file)) {
      addNode(
        getRootRelativePath(file.getFilePath(), repoRoot),
        root,
        getComplexityScoreOfFile(file)
      );
    }
  });

  files.forEach((file) => {
    if (!excludeFile(file)) {
      addEdges(file, edges, root, repoRoot);
    }
  });

  if (parsedRepoFilePathCache) {
    //  fs.writeFileSync(parsedRepoFilePathCache, JSON.stringify({ root, edges }));
  }
  return { edges, root };
}

function getComplexityScoreOfFile(file: SourceFile): number {
  return (
    getComplexityScoreOfClasses(file.getClasses()) +
    file.getFunctions().length +
    getComplexityScoreOfClasses(file.getInterfaces()) +
    file.getExportedDeclarations().size +
    file.getTypeAliases().length
  );
}

function getComplexityScoreOfClasses(node: Array<ClassDeclaration | InterfaceDeclaration>) {
  return (
    1 + node.reduce((sum, cls) => sum + cls.getMembers().length + cls.getProperties().length, 0)
  );
}
