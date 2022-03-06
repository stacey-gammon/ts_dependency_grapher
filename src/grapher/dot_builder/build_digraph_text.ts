import { GVEdgeMapping, LeafNode, ParentNode } from '../dependency_builder';
import { getDependenciesText } from '../graph_vis/build_edges_text';
import { getNodesText } from '../graph_vis/build_node_text';
import { AllNodeStats } from '..';
import { ApiItemMap } from '../dependency_builder/types/node_types';
import { Config } from '../../config/config';
import { RepoConfig } from '../../config/repo_config';

export function getDiGraphText(
  edges: GVEdgeMapping,
  rootNode: ParentNode | LeafNode,
  items: ApiItemMap,
  stats: AllNodeStats,
  config: RepoConfig
) {
  const maxImageSize = config.maxImageSize;

  return `digraph test {

ratio="compress";
fontsize="50"
${maxImageSize ? `size="${maxImageSize}, ${maxImageSize}!";` : ''}

${(rootNode as ParentNode).children
  .map((child) => {
    return getNodesText(child, items, stats, config);
  })
  .join('\n')}

${getDependenciesText(edges)}
}`;
}
