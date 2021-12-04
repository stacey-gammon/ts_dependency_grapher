import { SourceFile } from 'ts-morph';
import { GVEdgeMapping } from '../types/edge_types';
import { LeafNode, ParentNode } from '../types/types';
import { getRootRelativePath } from '../utils';
import { addEdges } from './add_edges';
import { excludeFile } from './should_exclude_file';

export function addEdgesFromFiles(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  files: SourceFile[],
  repoRoot: string,
  showExternalNodesOnly: boolean,
  excludeFilePaths?: Array<string>
) {
  files.forEach((file) => {
    const filePath = file.getFilePath();
    const relativePath = getRootRelativePath(filePath, repoRoot);
    if (relativePath && !excludeFile(filePath, excludeFilePaths)) {
      addEdges(file, edges, root, repoRoot, showExternalNodesOnly);
    }
  });
}
