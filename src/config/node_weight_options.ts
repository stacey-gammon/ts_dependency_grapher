// export const INCOMING_DEP_COUNT = 'IncomingDependencyCount';
// export const MAX_COUPLING_SCORE = 'MaxCouplingScore';
// export const PUBLIC_API_COUNT = 'PublicAPICount';

export enum NODE_SIZE_WEIGHT_OPTIONS {
  AFFERENT_COUPLING = 'afferent',
  EFFERENT_COUPLING = 'efferent',
  INTRA_DEPENDENCIES = 'intra',
  INTER_DEPENDENCIES = 'inter',
  ORG_SCORE = 'orgScore',
  INCOMING_DEP_COUNT = 'incomingDepCount',
  MAX_COUPLING_SCORE = 'maxCouplingScore',
  PUBLIC_API_COUNT = 'publicApiCount',
}

export enum NODE_COLOR_WEIGHT_OPTIONS {
  INCOMING_DEP_COUNT = 'incomingDepCount',
  MAX_COUPLING_SCORE = 'maxCouplingScore',
  PUBLIC_API_COUNT = 'publicApiCount',
  ORG_SCORE = 'orgScore',
  /**
   * Nodes will be colored based on their parent. Only relevant for
   * `nodeColorWeight`.
   */
  COLOR_BY_CLUSTER = 'cluster',
}

export const ORG_SCORE = 'orgScore';
