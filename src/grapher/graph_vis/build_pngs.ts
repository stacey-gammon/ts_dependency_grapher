import { execSync } from 'child_process';
import fs from 'fs';
import Path from 'path';
import { RepoConfig } from '../../config/repo_config';

export async function buildPngs({
  fileNamePrefix,
  repoInfo,
  dotPath,
}: {
  fileNamePrefix: string;
  dotPath: string;
  repoInfo: RepoConfig;
}): Promise<Array<{ layoutEngine: string; path: string }>> {
  const imageInfo: Array<{ layoutEngine: string; path: string }> = [];

  repoInfo.layoutEngines.forEach(async ({ name: layoutEngine, scale }) => {
    const uniqueFileName = `${fileNamePrefix}_${layoutEngine}`;
    const dotPngPath = Path.resolve(repoInfo.outputFolder, uniqueFileName + '.png');

    if (repoInfo.clearCache || !fs.existsSync(dotPngPath) || repoInfo.clearCache) {
      console.log(`Generating png for ${uniqueFileName}`);
      const doScaling = layoutEngine != 'fdp' && !scale;
      await execSync(
        `${layoutEngine} -x ${doScaling ? '-Goverlap=scale' : ''} -Tpng ${dotPath} > ${dotPngPath}`
      );
    } else {
      console.log(`Png for ${uniqueFileName} already exists.`);
    }

    imageInfo.push({ layoutEngine, path: uniqueFileName + '.png' });
  });

  return imageInfo;
}
