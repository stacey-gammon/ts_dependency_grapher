import { execSync } from 'child_process';
import fs from 'fs';
import Path from 'path';
import { OutputImageMapping } from '../types/image_types';
import { EntryInfo, RepoInfo } from '../config/repo_config_settings';
import { getConfig } from '../config';

export async function buildPngs({
  name,
  repoInfo,
  zoom,
  dotPath,
  repoImages,
  entry,
  moveRecommendationsCount,
}: {
  name: string;
  dotPath: string;
  repoInfo: RepoInfo;
  zoom?: number;
  entry?: EntryInfo;
  repoImages?: OutputImageMapping;
  moveRecommendationsCount: number;
}) {
  const config = getConfig();
  repoInfo.layoutEngines.forEach(async ({ name: layoutEngine, scale }) => {
    const outputIdWithEngine = `${name}_${layoutEngine}`;
    const dotPngPath = Path.resolve(config.outputFolder, outputIdWithEngine + '.png');

    if (repoImages) {
      if (!repoImages[repoInfo.fullName]) {
        repoImages[repoInfo.fullName] = { images: [], repoInfo };
      }

      repoImages[repoInfo.fullName].images.push({
        entry: entry?.file,
        path: outputIdWithEngine + '.png',
        layoutEngine,
        zoom: zoom ? zoom.toString() : undefined,
        moveRecommendationsCount,
      });
    }

    if (repoInfo.clearCache || !fs.existsSync(dotPngPath) || config.clearCache) {
      console.log(`Generating png for ${outputIdWithEngine} at zoom level ${zoom}`);
      const doScaling = layoutEngine != 'fdp' && !scale;
      await execSync(
        `${layoutEngine} -x ${doScaling ? '-Goverlap=scale' : ''} -Tpng ${dotPath} > ${dotPngPath}`
      );
    } else {
      console.log(`Png for ${outputIdWithEngine} at zoom level ${zoom} already exists.`);
    }
  });
}
