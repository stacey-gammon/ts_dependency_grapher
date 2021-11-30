import { StringMappingType } from '@ts-morph/common/lib/typescript';
import nconf from 'nconf';

export const INCOMING_DEP_COUNT = 'IncomingDependencyCount';
export const MAX_COUPLING_SCORE = 'MaxCouplingScore';
export const PUBLIC_API_COUNT = 'PublicAPICount';
export const ORG_SCORE = 'OrgScore';

export const NODE_WEIGHT_OPTIONS = [
  INCOMING_DEP_COUNT,
  MAX_COUPLING_SCORE,
  PUBLIC_API_COUNT,
  ORG_SCORE,
];

export const SIZE_NODE_BY_CONFIG_KEY = 'nodeSizeWeight';
export const COLOR_NODE_BY_CONFIG_KEY = 'nodeColorWeight';

export function validateConfig() {
  validateWeightOption(SIZE_NODE_BY_CONFIG_KEY);
  validateWeightOption(COLOR_NODE_BY_CONFIG_KEY);
}

function validateWeightOption(config: string) {
  const configVal = nconf.get(config);

  if (configVal && !NODE_WEIGHT_OPTIONS.includes(configVal)) {
    console.error(`ERROR: ${config} must be one of:
    ${NODE_WEIGHT_OPTIONS.join('\n')}    
        `);

    throw new Error('Invalid config');
  }
}

export interface EntryInfo {
  name: string;
  file: string;
}

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
