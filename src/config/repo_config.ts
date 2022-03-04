export interface RepoConfigInput {
  // Should be in the format owner/repo
  readonly fullName: string;

  // Absolute path to the repository root, if it is already downloaded. If undefined,
  // the repo will be downloaded from github and cloned to the cache folder.
  readonly rootPath?: string;

  // Relative path to the tsconfig file in the repo that should be used to generate the graphs.
  // Leave empty to attempt to use a tsconfig.json in the repo root.
  readonly tsconfig?: string;

  // If you want to point to a local folder, user "file", otherwise it'll download the
  // repo from GitHub and clone to the cache folder.
  //readonly source?: 'file' | 'github';

  // Only relevant if you use entry files. If you do, and this is true, it will
  // exclude all internal usages of the exports. This is useful for highlighting public
  // API usage.
  readonly showExternalNodesOnly?: boolean;

  // An optional name to the output files for this repo
  readonly outputName?: string;

  // Whether or not the cache should be cleared. This may be modified if changes are detected
  // in the repo code.
  clearCache?: boolean;

  /**
   * Optionally restrict the number of API item nodes. If this is undefined, every export from every
   * file in the project will be graphed, otherwise only the exports from these files will be graphed.
   * Files paths should be relative to the repo root.
   */
  readonly entries?: Array<string>;

  /**
   * Use to expand the number of files included in the source project. Useful if the tsconfig file
   * may not pick up on everything. This is used, for example, to forcefully include the x-pack
   * files in Kibana.
   */
  readonly extraSourceFileGlobs?: string[];

  // Will output an image for each layout option listed.
  readonly layoutEngines?: Array<{ name: string; scale?: boolean }>;
  // Restrict the graph to a certain depth. Files that are nested deeper than the
  // number will be "rolled up". It'll build data for each maxDepth level given.
  readonly maxDepths?: Array<number>;
}

export interface RepoConfig {
  // Where the images should go. This is inherited from ConfigOptions.
  readonly outputFolder: string;

  /**
   * Whether or not to take the recommendations of the clustering algorithm prior to generating
   * the dependency graph, in an attempt to programmatically re-organize a code base structure.
   * This is set at the top config level and passed down.
   */
  readonly takeRecommendations: boolean;

  // Should be in the format owner/repo
  readonly fullName: string;

  // Absolute path to the repository root.
  readonly rootPath: string;

  // Absolute path to the tsconfig file.
  readonly tsconfig: string;

  // Only relevant if you use entry files. If you do, and this is true, it will
  // exclude all internal usages of the exports. This is useful for highlighting public
  // API usage.
  readonly showExternalNodesOnly?: boolean;

  // An optional name to the output files for this repo
  readonly outputName?: string;

  // Whether or not the cache should be cleared. This may be modified if changes are detected
  // in the repo code.
  clearCache?: boolean;

  /**
   * Optionally restrict the number of API item nodes. If this is undefined, every export from every
   * file in the project will be graphed, otherwise only the exports from these files will be graphed.
   * Files paths should be relative to the repo root.
   */
  readonly entries?: Array<string>;

  /**
   * Use to expand the number of files included in the source project. Useful if the tsconfig file
   * may not pick up on everything. This is used, for example, to forcefully include the x-pack
   * files in Kibana.
   */
  readonly extraSourceFileGlobs?: string[];

  // Will output an image for each layout option listed.
  readonly layoutEngines: Array<{ name: string; scale?: boolean }>;

  // Restrict the graph to a certain depth. Files that are nested deeper than the
  // number will be "rolled up". It'll build data for each maxDepth level given.
  readonly maxDepths?: Array<number>;
}
