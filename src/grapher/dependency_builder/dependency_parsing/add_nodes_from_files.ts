import { SourceFile } from 'ts-morph';
import { LeafNode, ParentNode } from '../types';
import { getRootRelativePath } from '../../../utils';
import { ApiItemMap } from '../types/node_types';
import { getOrCreateNode } from './add_node';
import { getComplexityScoreOfFile } from './get_complexity_score';
import { excludeFile } from './should_exclude_file';

export function addNodesFromFiles(
  root: ParentNode | LeafNode,
  repoRoot: string,
  files: SourceFile[],
  apiItems: ApiItemMap,
  excludeFilePaths?: Array<string>
) {
  let i = 0;
  files.forEach((file) => {
    file.fixUnusedIdentifiers();
    console.log(`Adding nodes from file ${i}/${files.length}`);
    i++;
    const filePath = file.getFilePath();
    const relativePath = getRootRelativePath(filePath, repoRoot);
    // Skip any files that aren't within the repo root.
    if (relativePath && (!excludeFilePaths || !excludeFile(filePath, excludeFilePaths))) {
      getOrCreateNode(relativePath, root, getComplexityScoreOfFile(file), apiItems);
    }
  });
}
