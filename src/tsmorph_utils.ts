import { Node, ReferenceFindableNode } from 'ts-morph';
import { repoRoot } from './build_dot';
import { GVEdge, GVNode } from './types';

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

export function addGVNode(node: Node, nodes: GVNode[]) {
  nodes.push( {
    label: getIdForNode(node)
  });
}

export function addEdges(node: Node, edges: GVEdge[]) {
  if (Node.isReferenceFindableNode(node)) {
    const refNodes = node.findReferencesAsNodes();
    refNodes.forEach((ref) => {
      edges.push({
        dest: getIdForNode(node),
        source: getIdForNode(ref)
      });       
    });
  }
}

function getIdForNode(node: Node): string {
  const path = getRelativePath(node.getSourceFile().getFilePath());
  console.log('path is ' + path);
  return `${path.replace(/[/\\]/gi, '_')}_${isNamedNode(node) ? node.getName() : 'NoName'}`
}

function getRelativePath(path: string): string {
  return path.replace(repoRoot, '');
}