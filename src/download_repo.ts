import { execSync } from 'child_process';
import Path from 'path';
import fs from 'fs';
import nconf from 'nconf';
import { getConfig } from './config';
import { convertConfigRelativePathToAbsolutePath } from './utils';

interface ReturnResults {
  newData: boolean;
  dir: string;
}

export async function downloadRepo(fullName: string, refresh?: boolean): Promise<ReturnResults> {
  console.log(`download repo ${fullName}`);
  const htmlUrl = `https://github.com/${fullName}`;
  const cacheDir = convertConfigRelativePathToAbsolutePath(getConfig().repoCacheFolder);
  ensureRepoCacheFolderExists(cacheDir);
  const cloneDirectory = Path.resolve(cacheDir, fullName);
  if (fs.existsSync(cloneDirectory) && (nconf.get('clearCloneDirCache') || refresh)) {
    fs.rmSync(cloneDirectory, { recursive: true, force: true });
  }

  let newData = false;
  if (!fs.existsSync(cloneDirectory)) {
    console.log(`Cloning repo, ${fullName} into ${cloneDirectory}`);
    await execSync(`git clone ${htmlUrl} ${cloneDirectory}`);
  } else {
    console.log(`Repo, ${fullName} is already cloned into ${cloneDirectory}`);
    if (nconf.get('refresh')) {
      const output = await execSync('git pull origin', { cwd: cloneDirectory });
      if (output.indexOf('Already up to date') >= 0) {
        newData = false;
      } else {
        newData = true;
      }
    }
  }
  return { newData, dir: cloneDirectory };
}

function ensureRepoCacheFolderExists(cachefolder: string) {
  if (!fs.existsSync(cachefolder)) {
    console.log(`Cache folder ${cachefolder} does not exist, creating`);
    fs.mkdirSync(cachefolder);
  }
}
