import { Project, SourceFile } from 'ts-morph';
import Path from 'path';
import { File, Folder, GVEdgeMapping, ParentNode } from '../types';
import nconf from 'nconf';
import fs from 'fs';
import os from 'os';
import { getRootRelativePath } from '../utils';
import { addEdges, addGVNode, getIdForNode, isNamedNode } from './tsmorph_utils';
import { addFileToTree } from './add_file_to_tree';
import { getClusteredNodeForFolder } from './folder_to_clustered_node';

export function parseDependencies({
  entry,
  tsconfig,
  repo,
}: {
  repo: string;
  entry?: string;
  tsconfig: string;
}): { edges: GVEdgeMapping; root: ParentNode } {
  const project = new Project({ tsConfigFilePath: tsconfig });
  project.resolveSourceFileDependencies();

  const files: SourceFile[] = entry
    ? [project.getSourceFileOrThrow(entry)]
    : project.getSourceFiles();

  const repoRoot = Path.resolve(tsconfig, '..');

  nconf.set('REPO_ROOT', repoRoot);

  const folder: Folder = {
    name: 'root',
    path: 'root',
    folders: {},
    files: {},
  };

  const edges: GVEdgeMapping = parseFiles(files, folder, repoRoot, repo);
  return { edges, root: getClusteredNodeForFolder(folder) };
}

export function parseFiles(
  files: SourceFile[],
  root: Folder,
  repoRoot: string,
  repo: string
): GVEdgeMapping {
  const parsedRepoFilePathCache = Path.resolve(
    os.tmpdir(),
    repo.replace('/', '_') + 'ParsedRepo.json'
  );
  if (fs.existsSync(parsedRepoFilePathCache)) {
    const { cachedRoot, cachedEdges } = JSON.parse(
      fs.readFileSync(parsedRepoFilePathCache, { encoding: 'utf-8' })
    );
    root.files = cachedRoot.files;
    root.folders = cachedRoot.folders;
    return cachedEdges;
  }

  const gvEdges: GVEdgeMapping = {};

  files.forEach((file) => {
    const fileNode = addFileToTree(getRootRelativePath(file.getFilePath(), repoRoot), root);
    getNodesAndEdges(file, fileNode, gvEdges);
  });

  fs.writeFileSync(
    parsedRepoFilePathCache,
    JSON.stringify({ cachedRoot: root, cachedEdges: gvEdges })
  );
  return gvEdges;
}

/**
 *
 * @param source the file we want to extract exported declaration nodes from.
 * @param log
 */
function getNodesAndEdges(sourceFile: SourceFile, fileNode: File, gvEdges: GVEdgeMapping) {
  const exported = sourceFile.getExportedDeclarations();

  // Filter out the exported declarations that exist only for the plugin system itself.
  exported.forEach((val) => {
    val.forEach((destNode) => {
      const destNodeId = getIdForNode(destNode);
      const name: string = isNamedNode(destNode) ? destNode.getName() : '';
      if (destNode.getSourceFile().getFilePath() != sourceFile.getFilePath()) {
        // console.log(`node ${name} is defined in a different file. Skipping`);
        return;
      }
      if (name && name !== '') {
        addEdges(destNode, gvEdges);
        addGVNode(destNode, fileNode, gvEdges[destNodeId] ? gvEdges[destNodeId].length + 1 : 1);
      } else {
        console.log(
          'API with missing name encountered, text is ' + destNode.getText().substring(0, 50)
        );
      }
    });
  });
}
