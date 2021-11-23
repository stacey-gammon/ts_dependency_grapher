import { Node, ReferenceFindableNode } from 'ts-morph';
import { getSafeName } from '../graph_vis/utils';
import { File, GVEdgeMapping } from '../types';
import nconf from 'nconf';

export interface NamedNode extends Node {
  getName(): string;
}

/**
 * ts-morph has a Node.isNamedNode fn but it isn't returning true for all types
 * that will have node.getName.
 */
export function isNamedNode(node: Node | NamedNode | ReferenceFindableNode): node is NamedNode {
  return (node as NamedNode).getName !== undefined;
}

export function addGVNode(node: Node, file: File, incomingDependencyCount: number) {
  if (isNaN(incomingDependencyCount)) {
    throw new Error('why adding Nan to incomdepcount');
  }
  file.exports.push({
    id: getIdForNode(node),
    label: getLabelForNode(node),
    publicAPICount: 1,
    incomingDependencyCount,
    innerNodeCount: 0,
    innerDependencyCount: 0,
    maxSingleCoupleWeight: 0,

    // We might want to do something more complicated or recursive than this, but for now...
    complexityScore: node.getChildren().length,
  });
}

export function addEdges(destNode: Node, edges: GVEdgeMapping) {
  if (Node.isReferenceFindableNode(destNode)) {
    const refNodes = destNode.findReferencesAsNodes();
    refNodes.forEach((sourceNode) => {
      const sourceNodeId = getIdForNode(sourceNode);
      if (!edges[sourceNodeId]) {
        edges[sourceNodeId] = [];
      }
      edges[sourceNodeId].push({
        dest: getIdForNode(destNode),
        weight: 1,
      });
    });
  }
}

function getLabelForNode(node: Node) {
  if (isNamedNode(node)) return node.getName();

  const path = getRelativePath(node.getSourceFile().getFilePath());
  const filename = path.replace(/^.*[\\/]/, '');
  return filename;
}

export function getIdForNode(node: Node): string {
  const unsafePath = getRelativePath(node.getSourceFile().getFilePath());
  const name = isNamedNode(node) ? node.getName() : 'NoName';
  const path = getSafeName(unsafePath);
  return name ? [path, name].join('_') : path;
}

function getRelativePath(path: string): string {
  return path.replace(nconf.get('REPO_ROOT'), '');
}
