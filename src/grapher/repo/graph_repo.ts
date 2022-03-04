import { RepoConfig } from '../../config/repo_config';
import { syncRepo } from './download_repo';
import fs from 'fs';
import Path from 'path';
import { getTSMorphProject } from '../../get_tsmorph_project';
import { OutputImageMapping } from '../../types/image_types';
import { graph } from '../dependency_builder';

export async function graphRepo(repoInfo: RepoConfig, repoImages: OutputImageMapping) {
  const repo = repoInfo.fullName;
  console.log(`Graphing dependencies on repo "${repo}"`);

  const { newData } = await syncRepo(repo, repoInfo.rootPath, repoInfo.clearCache);

  if (newData) {
    repoInfo.clearCache = true;
  }

  if (!fs.existsSync(repoInfo.tsconfig)) {
    console.warn(`${repo} does not have a root tsconfig.json file at ${repoInfo.tsconfig}`);
    return;
  }

  const project = getTSMorphProjectInner(repoInfo);
  const fileNamePrefix = (repoInfo.outputName || repo).replace('/', '_');

  // 0 Means don't restrict.
  const maxDepths = repoInfo.maxDepths || [0];
  for (const zoom of maxDepths) {
    graph({
      project,
      fileNamePrefix,
      repoInfo,
      repoImages,
      zoom,
    });
  }
}

function getTSMorphProjectInner(repoInfo: RepoConfig) {
  const absSourceFilePaths = (repoInfo.extraSourceFileGlobs || []).map((relativePath) =>
    Path.resolve(repoInfo.rootPath, relativePath)
  );
  return getTSMorphProject(repoInfo.tsconfig, absSourceFilePaths);
}
