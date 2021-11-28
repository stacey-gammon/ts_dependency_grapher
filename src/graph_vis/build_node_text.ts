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
import { AllNodeStats } from '../stats/types';
import { getColorForLevel, getNodeProperties, getWeightedColor, getWeightedSize } from './styles';
import { getSafeName } from './utils';
import { isLeafNode } from '../zoom/zoom_out';

export function getNodeText(node: LeafNode, stats: AllNodeStats): string {
  const colorBy = nconf.get(COLOR_NODE_BY_CONFIG_KEY);
  const sizeBy = nconf.get(SIZE_NODE_BY_CONFIG_KEY);

  const matches = [ORG_SCORE, INCOMING_DEP_COUNT, MAX_COUPLING_SCORE, PUBLIC_API_COUNT];
  if (stats.stats[node.id].orgScore === undefined) {
    console.error(node);
    throw new Error('org score undefined');
  }

  const vals = [
    stats.stats[node.id].orgScore,
    stats.stats[node.id].interDependencyCount,
    stats.stats[node.id].maxSingleCoupleWeight,
    stats.stats[node.id].publicAPICount,
  ];
  const maxVals = [
    stats.maxes.orgScore,
    stats.maxes.interDependencyCount,
    stats.maxes.maxSingleCoupleWeight,
    stats.maxes.publicAPICount,
  ];
  const minVals = [
    stats.mins.orgScore,
    stats.mins.interDependencyCount,
    stats.mins.maxSingleCoupleWeight,
    stats.mins.publicAPICount,
  ];

  const colorByVal = getCorrectVal(colorBy, matches, vals);
  const colorByMaxVal = getCorrectVal(colorBy, matches, maxVals);
  const colorByMinVal = getCorrectVal(colorBy, matches, minVals);

  const sizeByVal = getCorrectVal(sizeBy, matches, vals);
  const sizeByMaxVal = getCorrectVal(sizeBy, matches, maxVals);
  const sizeByMinVal = getCorrectVal(sizeBy, matches, minVals);

  const color = getWeightedColor(colorByVal, colorByMinVal, colorByMaxVal);
  const scaledSize = getWeightedSize(sizeByVal, sizeByMinVal, sizeByMaxVal, 1, 5);

  // Such a crude way of scaling the font.
  let minFontSize = node.label.length > 10 ? 10 : 12;
  let maxFontSize = node.label.length > 10 ? 50 : 60;
  minFontSize = node.label.length > 20 ? 9 : minFontSize;
  maxFontSize = node.label.length > 20 ? 30 : maxFontSize;

  const fontSize = getWeightedSize(sizeByVal, sizeByMinVal, sizeByMaxVal, minFontSize, maxFontSize);

  const properties = getNodeProperties(node.label, color, scaledSize);

  return `${getSafeName(node.id)} [${properties} fontsize="${fontSize}"]\n`;
}

function getCorrectVal(configVal: string, matches: string[], vals: Array<number>): number {
  for (let i = 0; i < matches.length; i++) {
    if (matches[i] === configVal) {
      return vals[i];
    }
  }

  throw new Error(`${configVal} in ${matches} not found.`);
}

export function getNodesText(node: ParentNode | LeafNode, stats: AllNodeStats, level = 0): string {
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
        text += getNodeText(child, stats);
      } else {
        text += getNodesText(child, stats, level + 1);
      }
      +'\n';
    });
  }

  text += '}\n';

  return text;
}
