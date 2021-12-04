import { SourceFile } from 'ts-morph';
import { LeafNode, ParentNode } from '../types/types';
import { excludeFile, getRootRelativePath } from '../utils';
import { getOrCreateNode } from './add_node';
import { getComplexityScoreOfFile } from './get_complexity_score';

export function addNodesFromFiles(
  root: ParentNode | LeafNode,
  repoRoot: string,
  files: SourceFile[],
  excludeFilePaths?: Array<string>
) {
  files.forEach((file) => {
    const relativePath = getRootRelativePath(file.getFilePath(), repoRoot);
    // Skip any files that aren't within the repo root.
    if (relativePath && (!excludeFilePaths || !excludeFile(file, excludeFilePaths))) {
      getOrCreateNode(relativePath, root, getComplexityScoreOfFile(file));
    }
  });
}
