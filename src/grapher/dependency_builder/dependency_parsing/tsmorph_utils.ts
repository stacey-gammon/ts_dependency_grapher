import { Node, ReferenceFindableNode } from 'ts-morph';
import { getSafeName } from '../../utils';

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

export function getFilePathForTsNode(tsNode: Node, repoRoot: string) {
  return tsNode.getSourceFile().getFilePath().replace(repoRoot, '');
}

export function getIdForNode(node: Node, repoRoot: string): string {
  const unsafePath = getFilePathForTsNode(node, repoRoot);
  //const name = isNamedNode(node) ? node.getName() : 'NoName';
  const path = getSafeName(unsafePath);
  return path;
}
