import { GVEdgeMapping, LeafNode, ParentNode, AllNodeStats } from '../dependency_builder';
import { getDiGraphText } from './build_digraph_text';
import fs from 'fs';
import nconf from 'nconf';
import { RepoConfig } from '../../config/repo_config';
import { ApiItemMap } from '../dependency_builder/types/node_types';

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
  items: ApiItemMap,
  path: string,
  repoInfo: RepoConfig,
  stats: AllNodeStats
) {
  if (repoInfo.clearCache || nconf.get('clearCache') || !fs.existsSync(path)) {
    const text = getDiGraphText(edges, root, items, stats, repoInfo);
    if (!text) {
      throw new Error('Text not generated');
    }
    fs.writeFileSync(path, text);
    repoInfo.clearCache = true;
  }
}
