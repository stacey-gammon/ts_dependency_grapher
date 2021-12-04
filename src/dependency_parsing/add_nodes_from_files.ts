import { SourceFile } from 'ts-morph';
import { LeafNode, ParentNode } from '../types/types';
import { getRootRelativePath } from '../utils';
import { getOrCreateNode } from './add_node';
import { getComplexityScoreOfFile } from './get_complexity_score';
import { excludeFile } from './should_exclude_file';

export function addNodesFromFiles(
  root: ParentNode | LeafNode,
  repoRoot: string,
  files: SourceFile[],
  excludeFilePaths?: Array<string>
) {
  files.forEach((file) => {
    const filePath = file.getFilePath();
    const relativePath = getRootRelativePath(filePath, repoRoot);
    // Skip any files that aren't within the repo root.
    if (relativePath && (!excludeFilePaths || !excludeFile(filePath, excludeFilePaths))) {
      getOrCreateNode(relativePath, root, getComplexityScoreOfFile(file));
    }
  });
}
