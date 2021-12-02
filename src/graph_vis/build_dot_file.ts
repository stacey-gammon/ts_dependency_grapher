import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { getDiGraphText } from './build_digraph_text';
import fs from 'fs';
import nconf from 'nconf';
import { AllNodeStats } from '../stats/types';
import { RepoConfigSettings } from '../types/repo_config_settings';

/**
 *
 * @param edges
 * @param root
 * @param path The file location the cached output should be stored
 * @returns Whether the dot file has changes and anything based on it should be rebuilt.
 */
export function buildDotFile(
  edges: GVEdgeMapping,
  root: ParentNode | LeafNode,
  path: string,
  repoInfo: RepoConfigSettings,
  stats: AllNodeStats
) {
  if (repoInfo.clearCache || nconf.get('clearCache') || !fs.existsSync(path)) {
    const text = getDiGraphText(edges, root, stats);
    if (!text) {
      throw new Error('Text not generated');
    }
    fs.writeFileSync(path, text);
    repoInfo.clearCache = true;
  }
}
