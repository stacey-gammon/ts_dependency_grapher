import { GVEdgeMapping, LeafNode, ParentNode } from '../types';
import { getDependenciesText } from './build_edges_text';
import { getNodesText } from './build_node_text';
import nconf from 'nconf';
import { RangeWeights } from '../stats/types';

export function getDiGraphText(
  edges: GVEdgeMapping,
  rootNode: ParentNode | LeafNode,
  ranges: RangeWeights
) {
  const maxImageSize = nconf.get('maxImageSize');

  return `digraph test {

ratio="compress";
fontsize="50"
size="${maxImageSize}, ${maxImageSize}!";

${getNodesText(rootNode, ranges)}

${getDependenciesText(edges)}

}`;
}
