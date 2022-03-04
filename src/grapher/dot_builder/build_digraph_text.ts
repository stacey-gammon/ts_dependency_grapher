import { GVEdgeMapping, LeafNode, ParentNode } from '../dependency_builder';
import { getDependenciesText } from '../graph_vis/build_edges_text';
import { getNodesText } from '../graph_vis/build_node_text';
import { AllNodeStats } from '..';
import { getConfig } from '../../config';
import { ApiItemMap } from '../dependency_builder/types/node_types';

export function getDiGraphText(
  edges: GVEdgeMapping,
  rootNode: ParentNode | LeafNode,
  items: ApiItemMap,
  stats: AllNodeStats
) {
  const maxImageSize = getConfig().maxImageSize;

  return `digraph test {

ratio="compress";
fontsize="50"
${maxImageSize ? `size="${maxImageSize}, ${maxImageSize}!";` : ''}

${(rootNode as ParentNode).children
  .map((child) => {
    return getNodesText(child, items, stats);
  })
  .join('\n')}

${getDependenciesText(edges)}
}`;
}
