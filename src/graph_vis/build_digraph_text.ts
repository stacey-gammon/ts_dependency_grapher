import { LeafNode, ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { getDependenciesText } from './build_edges_text';
import { getNodesText } from './build_node_text';
import { AllNodeStats } from '../stats/types';
import { getConfig } from '../config';

export function getDiGraphText(
  edges: GVEdgeMapping,
  rootNode: ParentNode | LeafNode,
  stats: AllNodeStats
) {
  const maxImageSize = getConfig().maxImageSize;

  return `digraph test {

ratio="compress";
fontsize="50"
${maxImageSize ? `size="${maxImageSize}, ${maxImageSize}!";` : ''}

${(rootNode as ParentNode).children.map((child) => getNodesText(child, stats)).join('\n')}

${getDependenciesText(edges)}
}`;
}
