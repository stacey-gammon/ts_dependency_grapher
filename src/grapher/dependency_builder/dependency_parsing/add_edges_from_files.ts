import { SourceFile } from 'ts-morph';
import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { getRootRelativePath } from '../../../utils';
import { ApiItemMap } from '../types/node_types';
import { addEdges } from './add_edges';
import { excludeFile } from './should_exclude_file';
import { RepoConfig } from '../../../config/repo_config';

export function addEdgesFromFiles(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  items: ApiItemMap,
  files: SourceFile[],
  config: RepoConfig,
  repoRoot: string,
  showExternalNodesOnly: boolean,
  excludeFilePaths?: Array<string>
) {
  let i = 0;
  files.forEach((file) => {
    console.log(`Adding edges from file ${i}/${files.length}`);
    i++;
    const filePath = file.getFilePath();
    const relativePath = getRootRelativePath(filePath, repoRoot);
    if (relativePath && !excludeFile(filePath, excludeFilePaths)) {
      addEdges(file, edges, root, items, repoRoot, config, showExternalNodesOnly);
    }
  });
}
