import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { getDiGraphText } from './build_digraph_text';
import fs from 'fs';
import nconf from 'nconf';

/**
 *
 * @param edges
 * @param root
 * @param path The file location the cached output should be stored
 * @returns Whether the dot file has changes and anything based on it should be rebuilt.
 */
export async function buildDotFile(
  edges: GVEdgeMapping,
  root: ParentNode | LeafNode,
  path: string
): Promise<boolean> {
  if (nconf.get('clearDotCache') || !fs.existsSync(path)) {
    const text = getDiGraphText(edges, root);
    if (!text) {
      throw new Error('Text not generated');
    }
    fs.writeFileSync(path, text);
    return true;
  } else return false;
}
