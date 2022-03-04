export function excludeFile(filePath: string, excludeFilePaths?: string[]) {
  if (!excludeFilePaths) return false;

  return !!excludeFilePaths.find((path) => filePath.includes(path));
}
