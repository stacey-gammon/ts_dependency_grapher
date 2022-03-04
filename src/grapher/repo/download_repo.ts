import { execSync } from 'child_process';
import fs from 'fs';

interface ReturnResults {
  newData: boolean;
}

export async function syncRepo(
  fullName: string,
  dir: string,
  clearCache?: boolean
): Promise<ReturnResults> {
  if (fs.existsSync(dir) && clearCache) {
    console.log(`Clearing repo cache for ${fullName}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  if (!fs.existsSync(dir)) {
    downloadRepo(fullName, dir);
  }

  const output = await execSync('git pull origin', { cwd: dir });

  return {
    newData: output.indexOf('Already up to date') < 0,
  };
}

export async function downloadRepo(fullName: string, dir: string) {
  const htmlUrl = `https://github.com/${fullName}`;

  if (fs.existsSync(dir)) {
    throw new Error(`Repo ${dir} exists.`);
  }

  await execSync(`git clone ${htmlUrl} ${dir}`);
}
