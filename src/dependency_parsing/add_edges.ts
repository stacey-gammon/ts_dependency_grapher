import { Node, SourceFile } from 'ts-morph';
import { Edge, GVEdgeMapping, LeafNode, ParentNode } from '../types';
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
        refNodes.forEach((tsMSourceNode) => {
          if (excludeFile(tsMSourceNode.getSourceFile())) {
            return;
          }

          const sourceNodeId = getIdForNode(tsMSourceNode, repoRoot);
          const sourceNode = getNodeById(sourceNodeId, root);

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

          const path = getFilePathForTsNode(destNode, repoRoot);
          const node = addNode(path, root, 0);
          if (!node) {
            console.error(`Did not find node for path ${path} in root tree`, root);
            throw new Error(`Did not find node for path ${path} in root tree`);
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
