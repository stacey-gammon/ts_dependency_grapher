import { ExportedDeclarations, Node, SourceFile } from 'ts-morph';
import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { getRootRelativePath } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';
import { getOrCreateNode } from './add_node';
import { getFilePathForTsNode, getIdForNode } from './tsmorph_utils';
import nconf from 'nconf';
import { excludeFile } from './should_exclude_file';
import { addEdge } from './add_edge';
import { getNodeById } from './get_node_by_id';

export function addEdges(
  file: SourceFile,
  edges: GVEdgeMapping,
  root: ParentNode | LeafNode,
  repoRoot: string,
  showExternalNodesOnly?: boolean
) {
  const excludeTypes = nconf.get('excludeTypes');
  const globalExcludePaths = nconf.get('excludePaths');
  const exports = file.getExportedDeclarations();
  console.log(`${exports.size} exports found from file ${file.getSourceFile().getFilePath()}`);

  exports.forEach((val) => {
    val.forEach((destNode) => {
      if (Node.isReferenceFindableNode(destNode)) {
        if (excludeTypes && isTypeExport(destNode)) {
          return;
        }
        const destFilePath = getFilePathForTsNode(destNode, repoRoot);
        const refNodes = destNode.findReferencesAsNodes();
        if (destNode.getName) {
          console.log(
            `Found ${
              refNodes.length
            } references to node ${destNode.getName()} defined in file ${destFilePath}`
          );
        }
        refNodes.forEach((tsMSourceNode) => {
          const relativePath = getRootRelativePath(file.getFilePath(), repoRoot);
          if (!relativePath) return;

          const excludeFilePaths = showExternalNodesOnly
            ? [relativePath, ...globalExcludePaths]
            : [globalExcludePaths];

          if (excludeFile(tsMSourceNode.getSourceFile().getFilePath(), excludeFilePaths)) {
            console.log(`Skipping file ${tsMSourceNode.getSourceFile().getFilePath()}`);
            return;
          }

          const sourceNodeId = getIdForNode(tsMSourceNode, repoRoot);
          let sourceNode = getNodeById(sourceNodeId, root);
          if (!sourceNode) {
            const sourcePath = getFilePathForTsNode(tsMSourceNode, repoRoot);
            sourceNode = getOrCreateNode(sourcePath, root, 0);
            console.log(`Source node at ${sourcePath} doesn't exist in tree, adding it`);
          }

          if (!sourceNode) {
            console.error(
              `addEdges: Source node id is not found in the node tree: ${sourceNodeId}`,
              root
            );
            throw new Error(
              `addEdges: Source node id is not found in the node tree: ${sourceNodeId}`
            );
          }

          if (!isLeafNode(sourceNode)) {
            console.error(
              `addEdges: Source node id by ${sourceNodeId} is not a leaf node.`,
              sourceNode
            );
            throw new Error(`addEdges: Source node id by ${sourceNodeId} is not a leaf node.`);
          }

          const destNode = getOrCreateNode(destFilePath, root, 0);
          if (!destNode) {
            console.error(`Did not find node for path ${destFilePath} in root tree`, root);
            throw new Error(`Did not find node for path ${destFilePath} in root tree`);
          }

          if (!isLeafNode(destNode)) {
            console.error('All connections should be leaf nodes', destNode);
            throw new Error(`All connections should be leaf nodes. Node ${destNode.id} is not.`);
          }

          addEdge(edges, sourceNode, destNode);
        });
      }
    });
  });
}

function isTypeExport(node: ExportedDeclarations) {
  return Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node);
}
