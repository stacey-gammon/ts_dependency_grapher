import { RepoConfig } from '../config/repo_config';

export interface ImageInfo {
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
  images: Array<ImageInfo>;
  repoInfo: RepoConfig;
}
