import { execSync } from 'child_process';
import fs from 'fs';
import Path from 'path';
import nconf from 'nconf';
import { OutputImageMapping } from './types/image_types';
import { EntryInfo } from './config';
import { RepoConfigSettings } from './types/repo_config_settings';

export async function buildPngs({
  name,
  repoInfo,
  zoom,
  dotPath,
  repoImages,
  entry,
}: {
  name: string;
  dotPath: string;
  repoInfo: RepoConfigSettings;
  zoom?: number;
  entry?: EntryInfo;
  repoImages?: OutputImageMapping;
}) {
  repoInfo.layoutEngines.forEach(async ({ name: layoutEngine, scale }) => {
    const outputIdWithEngine = `${name}_${layoutEngine}`;
    const dotPngPath = Path.resolve(nconf.get('outputFolder'), outputIdWithEngine + '.png');

    if (repoImages) {
      if (!repoImages[repoInfo.full_name]) {
        repoImages[repoInfo.full_name] = { images: [], repoInfo };
      }

      repoImages[repoInfo.full_name].images.push({
        entry: entry?.file,
        path: outputIdWithEngine + '.png',
        layoutEngine,
        zoom: zoom ? zoom.toString() : undefined,
      });
    }

    if (repoInfo.clearCache || !fs.existsSync(dotPngPath) || nconf.get('clearCache')) {
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
