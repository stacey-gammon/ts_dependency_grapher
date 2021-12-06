export interface EntryInfo {
  name: string;
  file: string;
}

export interface RepoInfo {
  // Should be in the format owner/repo
  fullName: string;
  // Path to the repo's tsconfig file. If none given, will look for 'tsconfig.json' in the
  // repo root.
  tsconfig: string;
  // If you want to point to a local folder, user "file", otherwise it'll download the
  // repo from GitHub and clone to the cache folder.
  source?: 'file' | 'github';
  // Only relevant if you use entry files. If you do, and this is true, it will
  // exclude all internal usages of the exports. This is useful for highlighting public
  // API usage.
  showExternalNodesOnly?: boolean;
  // An optional name to the output files for this repo
  outputName?: string;
  clearCache?: boolean;
  entries?: Array<string>;
  extraSourceFileGlobs?: string[];
  // Will output an image for each layout option listed.
  layoutEngines: Array<{ name: string; scale?: boolean }>;
  // Restrict the graph to a certain depth. Files that are nested deeper than the
  // number will be "rolled up". It'll build data for each maxDepth level given.
  maxDepths?: Array<number>;
}
