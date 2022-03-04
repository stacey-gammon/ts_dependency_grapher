import { RepoConfigInput } from '../config/repo_config';
import { graphRepo } from './repo/graph_repo';
import { OutputImageMapping } from '../types/image_types';
import { resolveRepoConfigInput } from './repo/resolve_repo_config_input';
import { ConfigOptions } from '../config/config';

export async function runGrapher(config: ConfigOptions): Promise<OutputImageMapping> {
  const repoImages: OutputImageMapping = {};
  const repos: Array<RepoConfigInput> = config.repos;

  for (const repoConfigInput of repos) {
    const repoConfig = resolveRepoConfigInput(repoConfigInput, config);
    await graphRepo(repoConfig, repoImages);
  }
  return repoImages;
}
