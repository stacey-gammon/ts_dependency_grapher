import Path from 'path';
import { SourceFile } from 'ts-morph';
import nconf from 'nconf';
import { LeafNode, NodeStats } from './types';

export function getRootRelativePath(fullPath: string, repoRoot: string): string {
  return fullPath.substring(repoRoot.length);
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

export function excludeFile(file: SourceFile) {
  return ((nconf.get('excludeFilePaths') || []) as string[]).find((path) =>
    file.getFilePath().includes(path)
  );
}

export function getEmptyNodeCounts(): NodeStats {
  return {
    interDependencyCount: 0,
    intraDependencyCount: 0,
    afferentCoupling: 0,
    efferentCoupling: 0,
    publicAPICount: 0,
    orgScore: 0,
    innerNodeCount: 0,
    complexityScore: 0,
    maxSingleCoupleWeight: 0,
    incomingDependencyCount: 0,
  };
}
