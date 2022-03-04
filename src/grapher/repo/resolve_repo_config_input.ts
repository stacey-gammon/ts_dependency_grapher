import Path from 'path';
import { ConfigOptions } from '../../config/config';
import { DEFAULT_REPO_CONFIG } from '../../config/defaults';
import { RepoConfig, RepoConfigInput } from '../../config/repo_config';

/**
 * Add in default values, and convert relative to absolute paths, for the
 * repository configuration.
 * @param repoConfig
 * @param config
 * @returns
 */
export function resolveRepoConfigInput(
  repoConfig: RepoConfigInput,
  config: ConfigOptions
): RepoConfig {
  const rootPath = repoConfig.rootPath || Path.resolve(config.repoCacheFolder, repoConfig.fullName);
  return {
    ...repoConfig,
    ...DEFAULT_REPO_CONFIG,
    rootPath,
    outputFolder: config.outputFolder,
    takeRecommendations: config.takeRecommendations,
    clearCache: repoConfig.clearCache || config.clearCache,
    tsconfig: Path.resolve(rootPath, repoConfig.tsconfig || 'tsconfig.json'),
  };
}
