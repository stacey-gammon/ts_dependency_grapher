import fs from 'fs';
import {  getDotFileText } from './build_dot'
import nconf from 'nconf';
import { downloadRepo } from './download_repo';
import Path from 'path';
import { execSync} from 'child_process';
import { regenerateColorScheme } from './styles'
import { buildDocsSite } from './build_docs_site';
import { COLOR_NODE_BY_CONFIG_KEY, NODE_WEIGHT_OPTIONS, SIZE_NODE_BY_CONFIG_KEY, validateConfig } from './config';

interface Args {
  fullName: string;
  url: string;
}

export async function main() {
  nconf.argv()
    .defaults({
      outputFolder: "docs",
      buildSite: false,
      [COLOR_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[0],
      [SIZE_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[1],
      zooms: [2, 3, 4, 5],
    })
    .env()
    .file({ file: 'config/config.json' });

  validateConfig();

  const repos = nconf.get('repos') as string[];
  
  const repoImages: { [key: string]: { [key: string]: string } } = {};

  for (const repo of repos) {
    regenerateColorScheme();
    const path = await downloadRepo(repo);
    const tsconfig = Path.resolve(path.dir, 'tsconfig.json');

    if (!fs.existsSync(tsconfig)) {
      console.warn(`${repo} does not have a root tsconfig.json file.`);
      continue;
    }
    const maxImageSize = nconf.get('maxImageSize');
    const zoomLevels = nconf.get('zooms');
    for (const zoom of zoomLevels) {
      console.log(`Generating dot file for ${repo} at zoom level ${zoom}`);

      const dotOutputPath = Path.resolve(nconf.get('outputFolder'), repo.replace('/', '_') + `_z${zoom}.dot`);
      let redoPng = false;
      if (nconf.get('clearDotCache') || !fs.existsSync(dotOutputPath)) {
        const text = getDotFileText({ repo, tsconfig, zoom, maxImageSize});
        if (!text) {
          throw new Error('Text not generated');
        }
        fs.writeFileSync(dotOutputPath, text);
        redoPng = true;
      } else {
        console.log(`Dot file for ${repo} at zoom level ${zoom} already exists.`);
      }

      const imageFileName = repo.replace('/', '_') + `_z${zoom}.png`;
      const dotPngPath = Path.resolve(nconf.get('outputFolder'), imageFileName);
      if (!repoImages[repo]) repoImages[repo] = {};
      repoImages[repo][zoom] = imageFileName;

      if (redoPng || !fs.existsSync(dotPngPath)) {
        console.log(`Generating png for ${repo} at zoom level ${zoom}`);
        await execSync(`sfdp -x -Goverlap=scale -Tpng ${dotOutputPath} > ${dotPngPath}`);
      } else {
        console.log(`Png for ${repo} at zoom level ${zoom} already exists.`);
      }
    };
  }

  if (nconf.get('buildDocsSite')) {
    buildDocsSite(repoImages);
  }
}


main();