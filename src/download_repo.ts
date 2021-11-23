import { execSync } from 'child_process';
import Path from 'path';
import os from 'os';
import fs from 'fs';
import nconf from 'nconf';

interface ReturnResults {
  newData: boolean;
  dir: string;
}

export async function downloadRepo(fullName: string): Promise<ReturnResults> {
  const htmlUrl = `https://github.com/${fullName}`;
  const cloneDirectory = Path.resolve(os.tmpdir(), fullName);
  if (fs.existsSync(cloneDirectory) && nconf.get('clearCloneDirCache')) {
    fs.rmSync(cloneDirectory);
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
