
export function getRootRelativePath(fullPath: string, repoRoot: string): string {
  return fullPath.substring(repoRoot.length);
}

export function getDepth(container: Container | unknown, currDepth: number = 0): number {
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