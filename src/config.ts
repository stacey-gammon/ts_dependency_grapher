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

export const COLOR_NODE_BY_CLUSTER = 'cluster';
export const NODE_COLOR_WEIGHT_OPTIONS = [...NODE_WEIGHT_OPTIONS, COLOR_NODE_BY_CLUSTER];

export const SIZE_NODE_BY_CONFIG_KEY = 'nodeSizeWeight';
export const COLOR_NODE_BY_CONFIG_KEY = 'nodeColorWeight';

export function validateConfig() {
  validateWeightOption(SIZE_NODE_BY_CONFIG_KEY, NODE_WEIGHT_OPTIONS);
  validateWeightOption(COLOR_NODE_BY_CONFIG_KEY, NODE_COLOR_WEIGHT_OPTIONS);
}

function validateWeightOption(config: string, options: string[]) {
  const configVal = nconf.get(config);

  if (configVal && !options.includes(configVal)) {
    console.error(`ERROR: ${config} must be one of:
    ${options.join('\n')}    
        `);

    throw new Error('Invalid config');
  }
}

export interface EntryInfo {
  name: string;
  file: string;
}

export const CLUSTER_OPTION_ORG_SCORE = 'orgScore';
export const CLUSTER_OPTION_DBSCAN = 'dbscan';

export const CLUSTERING_OPTIONS = [CLUSTER_OPTION_DBSCAN, CLUSTER_OPTION_ORG_SCORE];
