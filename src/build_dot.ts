import { Project, SourceFile } from 'ts-morph'
import { addEdges, addGVNode, getIdForNode, isNamedNode } from './tsmorph_utils';
import { File, Folder, GVEdgeMapping } from './types';
import Path from 'path';
import { addFileToTree, getDiGraphText } from './dot_utils';
import { getRootRelativePath } from './utils';

export let repoRoot: string;

export function getDotFileText({ entry , zoom, tsconfig, maxImageSize}: { maxImageSize: number, entry?: string; tsconfig: string, zoom: number }): string | undefined{
  const { gvEdges, root } = getEdgesAndRoot({ entry, tsconfig });
  return  getDiGraphText(gvEdges, root, zoom, maxImageSize);
}

export function getEdgesAndRoot({ entry , tsconfig}: { entry?: string; tsconfig: string }): { gvEdges: GVEdgeMapping, root: Folder } {
  const project = new Project({ tsConfigFilePath: tsconfig });
  project.resolveSourceFileDependencies();
  
  const files: SourceFile[] = entry ? [project.getSourceFileOrThrow(entry)] : project.getSourceFiles();
  
  repoRoot = Path.resolve(tsconfig, '..');
  
  const root: Folder = {
    name: 'root',
    path: 'root',
    folders: {},
    files: {},  
  };
  
  const gvEdges: GVEdgeMapping = parseFiles(files, root, repoRoot);
  return  { gvEdges, root };
}

export function parseFiles(files: SourceFile[], root: Folder, repoRoot: string): GVEdgeMapping {
  const gvEdges: GVEdgeMapping = {};

  files.forEach(file => {
    const fileNode = addFileToTree(getRootRelativePath(file.getFilePath(), repoRoot), root);
    getNodesAndEdges(file, fileNode, gvEdges);    
  });
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
        console.log('API with missing name encountered, text is ' + destNode.getText().substring(0, 50));
      }
    });
  });
}
