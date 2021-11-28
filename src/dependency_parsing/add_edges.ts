import { Node, SourceFile } from 'ts-morph';
import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { excludeFile } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';
import { addNode } from './add_node';
import { getFilePathForTsNode, getIdForNode } from './tsmorph_utils';

export function addEdges(
  file: SourceFile,
  edges: GVEdgeMapping,
  root: ParentNode | LeafNode,
  repoRoot: string
) {
  const exports = file.getExportedDeclarations();
  //console.log(`Adding edges from file ${file.getSourceFile().getFilePath()}`);

  exports.forEach((val) => {
    val.forEach((destNode) => {
      if (Node.isReferenceFindableNode(destNode)) {
        const refNodes = destNode.findReferencesAsNodes();
        refNodes.forEach((sourceNode) => {
          if (excludeFile(sourceNode.getSourceFile())) {
            return;
          }

          const sourceNodeId = getIdForNode(sourceNode, repoRoot);
          const sourceDepNode = getNodeById(sourceNodeId, root);

          if (!sourceDepNode) {
            console.error(
              `addEdges: Source node id is not found in the node tree: ${sourceNodeId}`,
              root
            );
            throw new Error(
              `addEdges: Source node id is not found in the node tree: ${sourceNodeId}`
            );
          }

          if (!isLeafNode(sourceDepNode)) {
            console.error(
              `addEdges: Source node id by ${sourceNodeId} is not a leaf node.`,
              sourceDepNode
            );
            throw new Error(`addEdges: Source node id by ${sourceNodeId} is not a leaf node.`);
          }

          if (!edges[sourceNodeId]) {
            edges[sourceNodeId] = {
              source: sourceDepNode,
              destinations: [],
            };
          }

          const path = getFilePathForTsNode(destNode, repoRoot);
          const node = addNode(path, root, 0);
          if (!node) {
            console.error(`Did not find node for path ${path} in root tree`, root);
            throw new Error(`Did not find node for path ${path} in root tree`);
          }

          const foundDest = edges[sourceNodeId].destinations.find(
            (f) => f.destinationNode.id === node.id
          );

          if (!foundDest) {
            edges[sourceNodeId].destinations.push({
              destinationNode: node,
              dependencyWeight: 1,
            });
          } else {
            foundDest.dependencyWeight++;
          }
        });
      }
    });
  });
}

function getNodeById(id: string, node: ParentNode | LeafNode): ParentNode | LeafNode | undefined {
  if (node.id === id) {
    return node;
  }

  if (!isLeafNode(node)) {
    for (const child of node.children) {
      const found = getNodeById(id, child);
      if (found) return found;
    }
  }
  return undefined;
}
