import { ParentNode, LeafNode } from '../types';
import nconf from 'nconf';
import {
  COLOR_NODE_BY_CONFIG_KEY,
  INCOMING_DEP_COUNT,
  MAX_COUPLING_SCORE,
  ORG_SCORE,
  PUBLIC_API_COUNT,
  SIZE_NODE_BY_CONFIG_KEY,
} from '../config';
import { RangeWeights } from '../stats/types';
import { getColorForLevel, getNodeProperties, getWeightedColor, getWeightedSize } from '../styles';
import { getSafeName } from './utils';
import { isLeafNode } from '../zoom/zoom_out';

export function getNodeText(node: LeafNode, ranges: RangeWeights): string {
  const colorBy = nconf.get(COLOR_NODE_BY_CONFIG_KEY);
  const sizeBy = nconf.get(SIZE_NODE_BY_CONFIG_KEY);

  let maxCouplingWeight = node.maxSingleCoupleWeight;
  const innerNodeConnectionCount = node.interDependencyCount;

  maxCouplingWeight = isNaN(maxCouplingWeight) || maxCouplingWeight === 0 ? 1 : maxCouplingWeight;
  const orgScore = innerNodeConnectionCount - maxCouplingWeight;

  // console.log(`----Node ${node.id}------`);
  // console.log(`Max coupling weight: ${maxCouplingWeight} / ${maxNodeCouplingWeight}`);
  // console.log(`efferentCoupling: ${node.efferentCoupling}`);
  // console.log(`afferentCoupling: ${node.afferentCoupling}`);
  // console.log(`intraDependencyCount: ${node.intraDependencyCount}`);
  // console.log(`interDependencyCount: ${node.interDependencyCount}`);

  // console.log(`Public API count: ${node.publicAPICount} / ${maxPublicApiSize}`);
  // console.log(`Inner node count: ${node.innerNodeCount} / ?`);
  // console.log(`orgScore: ${orgScore} / ?`);

  const matches = [ORG_SCORE, INCOMING_DEP_COUNT, MAX_COUPLING_SCORE, PUBLIC_API_COUNT];
  if (node.orgScore === undefined) {
    console.error(node);
    throw new Error('org score undefined');
  }
  const vals = [
    node.orgScore,
    node.incomingDependencyCount,
    maxCouplingWeight,
    node.publicAPICount,
  ];
  const maxVals = [
    ranges.maxes.orgScore,
    ranges.maxes.interDependencyCount,
    ranges.maxes.maxSingleCoupleWeight,
    ranges.maxes.publicAPICount,
  ];
  const minVals = [
    ranges.mins.orgScore,
    ranges.mins.interDependencyCount,
    ranges.mins.maxSingleCoupleWeight,
    ranges.mins.publicAPICount,
  ];

  const colorByVal = getCorrectVal(colorBy, matches, vals);
  const colorByMaxVal = getCorrectVal(colorBy, matches, maxVals);
  const colorByMinVal = getCorrectVal(colorBy, matches, minVals);

  const sizeByVal = getCorrectVal(sizeBy, matches, vals);
  const sizeByMaxVal = getCorrectVal(sizeBy, matches, maxVals);
  const sizeByMinVal = getCorrectVal(sizeBy, matches, minVals);

  let color = getWeightedColor(colorByVal, colorByMinVal, colorByMaxVal);
  const scaledSize = getWeightedSize(sizeByVal, sizeByMinVal, sizeByMaxVal, 1, 5);

  // Such a crude way of scaling the font.
  let minFontSize = node.label.length > 10 ? 10 : 12;
  let maxFontSize = node.label.length > 10 ? 50 : 60;
  minFontSize = node.label.length > 20 ? 9 : minFontSize;
  maxFontSize = node.label.length > 20 ? 30 : maxFontSize;

  const fontSize = getWeightedSize(sizeByVal, sizeByMinVal, sizeByMaxVal, minFontSize, maxFontSize);

  if (node.orgScore < 0) {
    color = 'red';
  }
  const properties = getNodeProperties(node.label, color, scaledSize);

  return `${getSafeName(node.id)} [${properties} fontsize="${fontSize}"]\n`;
}

function getCorrectVal(configVal: string, matches: string[], vals: Array<number>): number {
  let indexInVal = 0;

  for (const match of matches) {
    if (match === configVal) {
      const returnVal = vals[indexInVal];
      if (returnVal === undefined) {
        console.error(`No valude for ${indexInVal} inside vals`, vals);
        console.error(`configVal ${configVal}, matches is`, matches);
        throw new Error(`No valude for ${indexInVal} inside vals`);
      }
    }
    indexInVal++;
  }

  return 1;
}

export function getNodesText(node: ParentNode | LeafNode, ranges: RangeWeights, level = 0): string {
  let text = '';

  if (isLeafNode(node)) {
    console.error('GVNode in getNodesText', node);
    throw new Error('GVNode in gtNodesText');
  } else if (!node.children) {
    console.error('no children in getNodesText', node);
    throw new Error('no children in gtNodesText');
  }
  if (node.children.length > 0) {
    text += `
subgraph cluster_${getSafeName(node.id)} {
style=filled
fontsize="50"
color="${getColorForLevel(level)}"  
label="${node.label}"
`;

    node.children.forEach((child) => {
      if (isLeafNode(child)) {
        text += getNodeText(child, ranges);
      } else {
        text += getNodesText(child, ranges, level + 1);
      }
      +'\n';
    });
  }

  text += '}\n';

  return text;
}
