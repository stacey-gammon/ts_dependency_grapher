import { CLUSTERING_ALGOS, Config } from './config';
import { NODE_COLOR_WEIGHT_OPTIONS } from './node_weight_options';

export const DEFAULT_CONFIG: Partial<Config> = {
  repoCacheFolder: '.repo_cache',
  usefulColors: true,
  clusteringAlgo: CLUSTERING_ALGOS.ORG_SCORE,
  orgScoreMoveThreshold: 5,
  maxImageSize: 10,
  excludeFilePaths: [],
  buildDocsSite: false,
  takeRecommendations: true,
  outputFolder: 'docs',
  nodeColorWeight: NODE_COLOR_WEIGHT_OPTIONS.COLOR_BY_CLUSTER,
  excludeTypes: true,
};

export const DEFAULT_REPO_CONFIG = {
  layoutEngines: [{ name: 'sfdp' }, { name: 'fdp' }],
};
