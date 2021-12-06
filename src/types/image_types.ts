import { RepoInfo } from '../config/repo_config_settings';

export interface OutputImage {
  path: string;
  entry?: string;
  zoom?: string;
  layoutEngine: string;
  moveRecommendationsCount: number;
}

export interface OutputImageMapping {
  [repoName: string]: ImagesForRepoConfig;
}

export interface ImagesForRepoConfig {
  images: Array<OutputImage>;
  repoInfo: RepoInfo;
}
