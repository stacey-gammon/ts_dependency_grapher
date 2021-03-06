import { RepoConfig, RepoConfigInput } from './repo_config';
import { NODE_SIZE_WEIGHT_OPTIONS, NODE_COLOR_WEIGHT_OPTIONS } from './node_weight_options';

export interface ConfigInput extends Partial<Omit<Config, 'repos'>> {
  repos: Array<RepoConfigInput>;
}

export interface Config {
  // The folder the repos being downloaded will be saved in.
  repoCacheFolder: string;
  // If true will delete all the cache files.
  clearCache?: boolean;

  // If true, only a useful color scheme will be used. If false, a color scheme will be chosen at
  // random. Having it false makes for prettier graphs, but it'll be harder to distinguish what
  // the colors indicate.
  usefulColors: boolean;

  // Array of repos you would like to analyze.
  repos: Array<RepoConfig>;

  // File glob path patterns you wish to skip over. Useful, for example, if you wish to
  // exclude test files and folders.
  excludeFilePaths: Array<string>;

  // Where the final images, dot files, and analysis files will be saved. If this
  // is for building the docs size, should be something within `docs`.
  outputFolder: string;
  // If given, limits the size of the images to this value in inches. Using a small image size
  // is helpful when building the docs site, but not so useful for analysis as often the images will be
  // many hundreds of MBs.
  maxImageSize?: number;
  // If true, an index.md page will be built that displays all the repos, images and
  // configuration files used to create them.
  buildDocsSite: boolean;
  // If you are interested in highlighting unused nodes in the graph, set this to something
  // bright.
  unusedNodeColor?: string;
  // How the node will be sized. Leave as undefined to have the node size determined automatically
  // based on the text inside.
  nodeSizeWeight?: NODE_SIZE_WEIGHT_OPTIONS;
  // How the node colors should be determined.
  nodeColorWeight: NODE_COLOR_WEIGHT_OPTIONS;
  // If true, two images will be created, a before and an after version. The after version will
  // be what the organizational structure would look like if you took all the recommendations
  // that will be listed in the recommendations file.
  takeRecommendations: boolean;
  // The algorithm which will be used to determine which move recommendations to offer.
  // "orgScore" is an algorithm I made up, dbscan can be described here:
  // https://towardsdatascience.com/dbscan-clustering-explained-97556a2ad556#:~:text=DBSCAN%20stands%20for%20density%2Dbased,many%20points%20from%20that%20cluster.
  // Since these aren't points in space, a distancing algorithm is made up.
  clusteringAlgo: CLUSTERING_ALGOS;
  // Only relevant if the clusteringAlgo is set to 'orgScore'. Certain moves will only be
  // suggested if they are "significant" enough. Significance is determined by comparing the
  // dependency weight between the new parent and the sums of the dependencies between every other
  // parent. If
  // dependencyWeight(newParent) - Sum(dependencyWeights(everyOtherParent)) > orgScoreMoveThreshold
  // then the move will be suggested. Raise this number to limit suggestions, lower it to get more.
  orgScoreMoveThreshold: number;
  // If true, edges that include a type only (e.g. an interface) will be excluded. Types are used
  // more prolifically than actual functionality so this can minimize noise and seemed to offer some
  // better suggestions.
  excludeTypes: boolean;
  recommendationFileType: 'csv' | 'md';
}

export enum CLUSTERING_ALGOS {
  ORG_SCORE = 'orgScore',
  DBSCAN = 'dbscan',
}
