import { getMaxCoupledWeight } from '../zoom/coupling_weights';
import { GVEdgeMapping, CodeChunkNode, LeafNode, ParentNode } from '../types';
import { isGVNode } from '../zoom/zoom_out';
import { getDependenciesText } from './build_edges_text';
import { getNodesText } from './build_node_text';
import nconf from 'nconf';

export function getDiGraphText(edges: GVEdgeMapping, rootNode: ParentNode | LeafNode) {
  const maxPublicApiSize = findMaxVal(rootNode, 0, 'publicAPICount');
  const maxIncomingDependencyCount = findMaxVal(rootNode, 0, 'incomingDependencyCount');
  const maxNodeCouplingWeight = getMaxCoupledWeight(rootNode);
  const maxImageSize = nconf.get('maxImageSize');

  return `digraph test{
        ratio="compress";
        size="${maxImageSize}, ${maxImageSize}!";
        ${getNodesText(rootNode, {
          maxPublicApiSize,
          maxIncomingDependencyCount,
          maxNodeCouplingWeight,
        })}
         ${getDependenciesText(edges)}
      }`;
}

function findMaxVal(node: ParentNode | CodeChunkNode, max = 0, key: keyof CodeChunkNode): number {
  if (isGVNode(node)) {
    const val: number = node[key] as number;
    return val > max ? val : max;
  } else {
    let maxChild = max;
    node.children.forEach((child) => {
      const childSize = findMaxVal(child, maxChild, key);
      if (childSize > maxChild) {
        maxChild = childSize;
      }
    });
    return maxChild;
  }
}
