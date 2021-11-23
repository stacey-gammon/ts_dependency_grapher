import { ParentNode, CodeChunkNode, LeafNode } from '../types';
import nconf from 'nconf';
import {
  COLOR_NODE_BY_CONFIG_KEY,
  INCOMING_DEP_COUNT,
  MAX_COUPLING_SCORE,
  PUBLIC_API_COUNT,
  SIZE_NODE_BY_CONFIG_KEY,
} from '../config';
import { MaxWeights } from './types';
import { getColorForLevel, getNodeProperties, getWeightedColor, getWeightedSize } from '../styles';
import { getSafeName } from './utils';
import { isGVNode, isGVNodeArray } from '../zoom/zoom_out';

export function getNodeText(
  node: CodeChunkNode,
  { maxPublicApiSize, maxIncomingDependencyCount, maxNodeCouplingWeight }: MaxWeights
): string {
  const colorBy = nconf.get(COLOR_NODE_BY_CONFIG_KEY);
  const sizeBy = nconf.get(SIZE_NODE_BY_CONFIG_KEY);

  const maxCouplingWeight = node.maxSingleCoupleWeight;
  const innerNodeConnectionCount = node.innerDependencyCount;
  const cohesion =
    node.innerNodeCount === 1
      ? 1
      : innerNodeConnectionCount / (node.innerNodeCount * node.innerNodeCount);

  console.log(`----Node ${node.id}------`);
  console.log(`Max coupling weight: ${maxCouplingWeight} / ${maxNodeCouplingWeight}`);
  console.log(`Cohesion score: ${cohesion} / ?`);
  console.log(
    `Incoming dependency weight: ${node.incomingDependencyCount} / ${maxIncomingDependencyCount}`
  );
  console.log(`Public API count: ${node.publicAPICount} / ${maxPublicApiSize}`);
  console.log(`Inner node count: ${node.innerNodeCount} / ?`);

  const matches = [INCOMING_DEP_COUNT, MAX_COUPLING_SCORE, PUBLIC_API_COUNT];
  const vals = [node.incomingDependencyCount, maxCouplingWeight, node.publicAPICount];
  const maxVals = [maxIncomingDependencyCount, maxNodeCouplingWeight, maxPublicApiSize];

  const colorByVal = getCorrectVal(colorBy, matches, vals);
  const colorByMaxVal = getCorrectVal(colorBy, matches, maxVals);
  const sizeByVal = getCorrectVal(sizeBy, matches, vals);
  const sizeByMaxVal = getCorrectVal(sizeBy, matches, maxVals);

  console.log(`colorByVal: ${colorByVal}, maxColorByVal: ${colorByMaxVal}`);
  console.log(`sizeByVal: ${sizeByVal}, sizeByMaxVal: ${sizeByMaxVal}`);

  console.log(
    `node ${node.id} has innerNodeCount of ${node.innerNodeCount} and inner dependency count of ${innerNodeConnectionCount} equaling cohesion of ${cohesion}`
  );

  const color = getWeightedColor(colorByVal, colorByMaxVal);
  const scaledSize = getWeightedSize(sizeByVal, sizeByMaxVal, 6, 16);
  const fontSize = getWeightedSize(sizeByVal, sizeByMaxVal, 50, 150);
  const properties = getNodeProperties(node.label, color, scaledSize);

  console.log(`scaledSize: ${scaledSize}`);

  return `${getSafeName(node.id)} [${properties} fontsize="${fontSize}"]\n`;
}

function getCorrectVal(configVal: string, matches: string[], vals: Array<number>): number {
  let indexInVal = 0;

  for (const match of matches) {
    if (match === configVal) {
      return vals[indexInVal];
    } else {
      console.log(`${match} != ${configVal}`);
    }
    indexInVal++;
  }

  return 1;
}

export function getNodesText(node: ParentNode | LeafNode, maxes: MaxWeights, level = 0): string {
  let text = '';

  if (isGVNode(node)) {
    console.error('GVNode in getNodesText', node);
    throw new Error('GVNode in gtNodesText');
  } else if (!node.children) {
    console.error('no children in getNodesText', node);
    throw new Error('no children in gtNodesText');
  }
  if (node.children.length > 0) {
    text += `subgraph cluster_${getSafeName(node.id)} {
        style=filled
        color="${getColorForLevel(level)}"  
        label="${getSafeName(node.label)}"
        `;
    if (isGVNodeArray(node.children)) {
      node.children.forEach((child) => {
        text += getNodeText(child, maxes) + '\n';
      });
    } else {
      node.children.forEach((child) => {
        text += getNodesText(child, maxes, level + 1);
        +'\n';
      });
    }
    text += '}\n';
  }

  return text;
}
