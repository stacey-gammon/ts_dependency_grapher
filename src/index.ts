import fs from 'fs';
import nconf from 'nconf';
import { downloadRepo } from './download_repo';
import Path from 'path';
import { execSync } from 'child_process';
import { regenerateColorScheme } from './styles';
import { buildDocsSite } from './build_docs_site';
import {
  COLOR_NODE_BY_CONFIG_KEY,
  NODE_WEIGHT_OPTIONS,
  SIZE_NODE_BY_CONFIG_KEY,
  validateConfig,
} from './config';
import { parseDependencies } from './ts_morph/parse_dependencies';
import { zoomOut } from './zoom/zoom_out';
import { getDiGraphText } from './graph_vis/build_digraph_text';
import { LeafNode, ParentNode } from './types';
import { rollupEdges } from './zoom/rollup_edges';
import { buildDotFile } from './graph_vis/build_dot_file';

export async function main() {
  nconf
    .argv()
    .defaults({
      outputFolder: 'docs',
      buildSite: false,
      [COLOR_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[0],
      [SIZE_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[1],
      zooms: [2, 3, 4, 5],
    })
    .env()
    .file({ file: 'config/config.json' });

  validateConfig();

  const repos: Array<{ full_name: string; tsconfig: string }> = nconf.get('repos');

  const repoImages: { [key: string]: { [key: string]: string } } = {};

  for (const repoInfo of repos) {
    const repo = repoInfo.full_name;
    regenerateColorScheme();
    const path = await downloadRepo(repo);
    const tsconfigPath = repoInfo.tsconfig || 'tsconfig.json';
    const tsconfig = Path.resolve(path.dir, tsconfigPath);

    if (!fs.existsSync(tsconfig)) {
      console.warn(`${repo} does not have a root tsconfig.json file at ${tsconfig}`);
      continue;
    }

    console.log(`Collecting stats for ${repo}`);
    const { edges, root } = parseDependencies({ tsconfig, repo });

    const zoomLevels = nconf.get('zooms');
    for (const zoom of zoomLevels) {
      console.log(`Zooming out to level ${zoom}`);

      const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, edges, zoom);

      console.log(`Generating dot file for ${repo} at zoom level ${zoom}`);

      const dotOutputPath = Path.resolve(
        nconf.get('outputFolder'),
        repo.replace('/', '_') + `_z${zoom}.dot`
      );
      const redoPng = await buildDotFile(zoomedOutEdges, zoomedOutRoot, dotOutputPath);

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
    }
  }

  if (nconf.get('buildDocsSite')) {
    buildDocsSite(repoImages);
  }
}

main();
