import { EntryInfo } from '../config';

export interface RepoConfigSettings {
  full_name: string;
  tsconfig: string;
  clearCache?: boolean;
  outputName?: string;
  source?: string;
  entries?: Array<EntryInfo>;
  showExternalNodesOnly?: boolean;
  extraSourceFileGlobs?: string[];
  layoutEngines: Array<{
    name: string;
    scale: boolean;
  }>;
  zooms?: Array<number>;
}
