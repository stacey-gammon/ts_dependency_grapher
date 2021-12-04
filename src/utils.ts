import Path from 'path';
import { SourceFile } from 'ts-morph';
import { LeafNode, ParentNode } from './types/types';

export function getRootRelativePath(fullPath: string, repoRoot: string): string | undefined {
  if (!fullPath.startsWith(repoRoot)) {
    return undefined;
    throw new Error(`Path "${fullPath}"" does not start with the repo root, "${repoRoot}".`);
  } else {
    return fullPath.substring(repoRoot.length);
  }
}

export function getDepth(container: Container | unknown, currDepth = 0): number {
  if (!isContainer(container) || container.children.length === 0) {
    return currDepth;
  } else if (isContainer(container)) {
    return container.children.reduce((maxDepth: number, child) => {
      const childDepth = getDepth(child, currDepth + 1);
      return childDepth > maxDepth ? childDepth : maxDepth;
    }, 0);
  } else return currDepth;
}
interface Container {
  children: Array<Container | unknown>;
}

function isContainer(container: Container | unknown): container is Container {
  return (container as Container).children != undefined;
}

export function getParentFolder(filePath: string) {
  return filePath.substring(0, filePath.lastIndexOf(Path.sep));
}

export function getEmptyNodeCounts(): {
  publicAPICount: number;
  innerNodeCount: number;
  complexityScore: number;
} {
  return {
    publicAPICount: 0,
    innerNodeCount: 0,
    complexityScore: 0,
  };
}

export function deCircularifyEdges(key: unknown, val: unknown | object) {
  if (key === 'node') return (val as LeafNode | ParentNode).id;
  return val;
}

export function deCircularify(key: unknown, val: unknown | object) {
  if (key === 'parentNode') return (val as LeafNode | ParentNode).id;
  return val;
}

export function convertConfigRelativePathToAbsolutePath(path: string) {
  return Path.resolve(__dirname, '..', '..', path);
}
