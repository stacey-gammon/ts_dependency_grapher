import { Node, SourceFile } from 'ts-morph';
import { Edge, GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { excludeFile, getRootRelativePath } from '../utils';
import { isLeafNode } from '../zoom/zoom_out';
import { getOrCreateNode } from './add_node';
import { getFilePathForTsNode, getIdForNode } from './tsmorph_utils';

export function addEdges(
  file: SourceFile,
  edges: GVEdgeMapping,
  root: ParentNode | LeafNode,
  repoRoot: string,
  showExternalNodesOnly?: boolean
) {
  const exports = file.getExportedDeclarations();
  console.log(`${exports.size} exports found from file ${file.getSourceFile().getFilePath()}`);

  exports.forEach((val) => {
    val.forEach((destNode) => {
      if (Node.isReferenceFindableNode(destNode)) {
        const destFilePath = getFilePathForTsNode(destNode, repoRoot);
        const refNodes = destNode.findReferencesAsNodes();
        console.log(
          `Found ${
            refNodes.length
          } references to node ${destNode.getName()} defined in file ${destFilePath}`
        );
        refNodes.forEach((tsMSourceNode) => {
          const excludeFilePaths = showExternalNodesOnly
            ? [getRootRelativePath(file.getFilePath(), repoRoot)]
            : [];
          if (excludeFile(tsMSourceNode.getSourceFile(), excludeFilePaths)) {
            console.log(`Skipping file ${tsMSourceNode.getSourceFile().getFilePath()}`);
            return;
          } else {
            console.log(
              `Adding reference to ${destNode.getName()}  from file ${tsMSourceNode
                .getSourceFile()
                .getFilePath()}`
            );
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

          const node = getOrCreateNode(destFilePath, root, 0);
          if (!node) {
            console.error(`Did not find node for path ${destFilePath} in root tree`, root);
            throw new Error(`Did not find node for path ${destFilePath} in root tree`);
          }

          if (!isLeafNode(node)) {
            console.error('All connections should be leaf nodes', node);
            throw new Error(`All connections should be leaf nodes. Node ${node.id} is not.`);
          }

          if (!edges[sourceNodeId]) {
            edges[sourceNodeId] = {
              node: sourceNode,
              outgoing: [],
              incoming: [],
            };
          }
          addConnection(node, edges[sourceNodeId].outgoing);

          if (!edges[node.id]) {
            edges[node.id] = {
              node: node,
              outgoing: [],
              incoming: [],
            };
          }
          addConnection(sourceNode, edges[node.id].incoming);
        });
      }
    });
  });
}

function addConnection(node: LeafNode, connections: Edge[]) {
  const connectionExists = connections.find((f) => f.node.id === node.id);

  if (connectionExists) {
    connectionExists.dependencyWeight++;
  } else {
    connections.push({
      node,
      dependencyWeight: 1,
    });
  }
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
