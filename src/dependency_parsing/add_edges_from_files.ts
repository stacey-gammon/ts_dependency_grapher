import { SourceFile } from 'ts-morph';
import { GVEdgeMapping } from '../types/edge_types';
import { LeafNode, ParentNode } from '../types/types';
import { excludeFile, getRootRelativePath } from '../utils';
import { addEdges } from './add_edges';

export function addEdgesFromFiles(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  files: SourceFile[],
  repoRoot: string,
  showExternalNodesOnly: boolean,
  excludeFilePaths?: Array<string>
) {
  files.forEach((file) => {
    const relativePath = getRootRelativePath(file.getFilePath(), repoRoot);
    if (relativePath && !excludeFile(file, excludeFilePaths)) {
      addEdges(file, edges, root, repoRoot, showExternalNodesOnly);
    }
  });
}
