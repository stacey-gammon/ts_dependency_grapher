import Path from 'path';
import fs from 'fs';

export function writeIndexFile(contents: string, outputFolder: string) {
  const indexFilePath = Path.resolve(outputFolder, 'index.md');

  fs.writeFileSync(indexFilePath, contents);
}
