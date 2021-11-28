import fs from 'fs';
import nconf from 'nconf';
import { downloadRepo } from './download_repo';
import Path from 'path';
import { execSync } from 'child_process';
import { regenerateColorScheme } from './graph_vis/styles';
import { buildDocsSite } from './build_docs_site';
import {
  COLOR_NODE_BY_CONFIG_KEY,
  NODE_WEIGHT_OPTIONS,
  SIZE_NODE_BY_CONFIG_KEY,
  validateConfig,
} from './config';
import { parseDependencies } from './dependency_parsing/parse_dependencies';
import { zoomOut } from './zoom/zoom_out';
import { buildDotFile } from './graph_vis/build_dot_file';
import { generateCSVs } from './generate_csv';
import { fillNodeStats } from './stats/fill_node_stats';

export async function main() {
  nconf
    .argv()
    .env()
    .file({ file: 'config/config.json' })
    .defaults({
      outputFolder: 'docs',
      buildSite: false,
      [COLOR_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[0],
      [SIZE_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[1],
      zooms: [2, 3, 4, 5],
    });

  validateConfig();

  const repos: Array<{
    full_name: string;
    tsconfig: string;
    refresh?: boolean;
    outputName?: string;
    source?: string;
  }> = nconf.get('repos');

  const repoImages: { [key: string]: { [key: string]: string } } = {};

  for (const repoInfo of repos) {
    const repo = repoInfo.full_name;
    console.log('Looping through ' + repo);
    regenerateColorScheme();

    let tsconfig;
    if (repoInfo.source !== 'file') {
      const path = await downloadRepo(repo, repoInfo.refresh);
      const tsconfigPath = repoInfo.tsconfig || 'tsconfig.json';
      tsconfig = Path.resolve(path.dir, tsconfigPath);
    } else {
      tsconfig = Path.resolve(__dirname, '..', '..', repoInfo.tsconfig);
    }

    if (!fs.existsSync(tsconfig)) {
      console.warn(`${repo} does not have a root tsconfig.json file at ${tsconfig}`);
      continue;
    }

    const id = repo + '/' + (repoInfo.tsconfig || 'tsconfig.json');
    console.log(`Collecting stats for ${id}`);

    const outputName = (repoInfo.outputName || repo).replace('/', '_');

    const { edges, root } = parseDependencies({
      tsconfig,
      repo,
      outputNameForCache: outputName,
      refresh: !!repoInfo.refresh,
    });

    const zoomLevels = nconf.get('zooms');

    console.error('ZOOMS ARE ', zoomLevels);
    for (const zoom of zoomLevels) {
      console.log(`Zooming out to level ${zoom}`);

      const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, edges, zoom);

      const stats = fillNodeStats(zoomedOutRoot, zoomedOutEdges);

      generateCSVs(zoomedOutRoot, zoomedOutEdges, outputName + `_z${zoom}_`, stats);

      console.log(`Generating dot file for ${id} at zoom level ${zoom}`);

      const dotOutputPath = Path.resolve(nconf.get('outputFolder'), outputName + `_z${zoom}.dot`);

      const redoPng = await buildDotFile(
        zoomedOutEdges,
        zoomedOutRoot,
        dotOutputPath,
        !!repoInfo.refresh,
        stats
      );

      ['sfdp', 'fdp'].forEach(async (layoutEngine) => {
        const imageFileName = outputName + `_z${zoom}_${layoutEngine}.png`;
        const dotPngPath = Path.resolve(nconf.get('outputFolder'), imageFileName);

        if (!repoImages[outputName + layoutEngine]) repoImages[outputName + layoutEngine] = {};
        repoImages[outputName + layoutEngine][zoom] = imageFileName;

        if (redoPng || !fs.existsSync(dotPngPath) || nconf.get('refresh')) {
          console.log(`Generating png for ${id} at zoom level ${zoom}`);
          await execSync(
            `${layoutEngine} -x -Goverlap=scale -Tpng ${dotOutputPath} > ${dotPngPath}`
          );
        } else {
          console.log(`Png for ${id} at zoom level ${zoom} already exists.`);
        }
      });
    }
  }

  if (nconf.get('buildDocsSite')) {
    buildDocsSite(repoImages);
  }
}

main();
