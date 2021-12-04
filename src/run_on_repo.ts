import { RepoConfigSettings } from './config/repo_config_settings';
import { downloadRepo } from './download_repo';
import { regenerateColorScheme } from './graph_vis/styles';
import Path from 'path';
import { convertConfigRelativePathToAbsolutePath } from './utils';
import fs from 'fs';
import { getTSMorphProject } from './get_tsmorph_project';
import { parseDependencies } from './dependency_parsing/parse_dependencies';
import nconf from 'nconf';
import { runDependencyAlgorithms } from './run_dependency_algorithms';
import { OutputImageMapping } from './types/image_types';

export async function runOnRepo(repoInfo: RepoConfigSettings, repoImages: OutputImageMapping) {
  const repo = repoInfo.full_name;
  console.log('Running on repo ' + repo);

  regenerateColorScheme();

  let tsconfig;
  if (repoInfo.source !== 'file') {
    const { dir, newData } = await downloadRepo(repo, repoInfo.clearCache);
    repoInfo.tsconfig = Path.resolve(dir, repoInfo.tsconfig);
    if (newData) {
      repoInfo.clearCache = true;
    }
  } else {
    repoInfo.tsconfig = convertConfigRelativePathToAbsolutePath(repoInfo.tsconfig);
  }

  if (!fs.existsSync(repoInfo.tsconfig)) {
    console.warn(`${repo} does not have a root tsconfig.json file at ${tsconfig}`);
    return;
  }

  const outputName = (repoInfo.outputName || repo).replace('/', '_');

  const project = getTSMorphProject(repoInfo);

  const entries = repoInfo.entries || [undefined];

  for (const entry of entries) {
    const { edges, root } = parseDependencies({
      repoInfo,
      project,
      entry,
    });

    const zoom = nconf.get('zoom');
    const zoomLevels = repoInfo.zooms;
    // Running a single zoom level trumps running all of them.
    if (zoom) {
      runDependencyAlgorithms({
        edges,
        root,
        name: outputName,
        zoom,
        repoInfo,
        repoImages,
        entry,
      });
    } else if (zoomLevels && zoomLevels.length > 0) {
      for (const zoom of zoomLevels) {
        runDependencyAlgorithms({
          edges,
          root,
          name: outputName,
          zoom,
          repoInfo,
          repoImages,
          entry,
        });
      }
    } else {
      runDependencyAlgorithms({ edges, root, name: outputName, repoInfo, repoImages, entry });
    }
  }
}
