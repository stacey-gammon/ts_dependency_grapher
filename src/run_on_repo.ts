import { RepoInfo } from './config/repo_config_settings';
import { downloadRepo } from './download_repo';
import { regenerateColorScheme } from './graph_vis/styles';
import Path from 'path';
import { convertConfigRelativePathToAbsolutePath } from './utils';
import fs from 'fs';
import { getTSMorphProject } from './get_tsmorph_project';
import { parseDependences as parseDependencies } from './dependency_parsing/parse_dependencies';
import { runDependencyAlgorithms } from './run_dependency_algorithms';
import { OutputImageMapping } from './types/image_types';

export async function runOnRepo(repoInfo: RepoInfo, repoImages: OutputImageMapping) {
  const repo = repoInfo.fullName;
  console.log('Running on repo ' + repo);

  regenerateColorScheme();

  let tsconfig;
  if (repoInfo.source !== 'file') {
    const { dir, newData } = await downloadRepo(repo, repoInfo.clearCache);
    repoInfo.tsconfig = Path.resolve(__dirname, dir, repoInfo.tsconfig);
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

  const entries = repoInfo.entries;

  // 0 Means don't restrict.
  const maxDepths = repoInfo.maxDepths || [0];
  for (const zoom of maxDepths) {
    const { edges, root } = parseDependencies({
      repoInfo,
      project,
      entries,
    });
    runDependencyAlgorithms({
      edges,
      root,
      name: outputName,
      zoom,
      repoInfo,
      repoImages,
    });
  }
}
