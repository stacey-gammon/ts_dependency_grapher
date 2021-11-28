import { NodeStats } from '../types';

export interface AllNodeStats {
  stats: { [key: string]: NodeStats };
  maxes: NodeStats;
  mins: NodeStats;
}
