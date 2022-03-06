import { AllNodeStats, ParentNode, LeafNode } from '../dependency_builder';
import {
  CLUSTER_COLORS,
  getColorForLevel,
  getNodeProperties,
  getWeightedColor,
  getWeightedSize,
} from './styles';
import { getLabel, getSafeName } from './utils';
import { isLeafNode } from '../dependency_builder/';
import {
  NODE_COLOR_WEIGHT_OPTIONS,
  NODE_SIZE_WEIGHT_OPTIONS,
} from '../../config/node_weight_options';
import { ApiItemMap } from '../dependency_builder/types/node_types';
import { isParentNode } from '../dependency_builder/utils';
import { RepoConfig } from '../../config/repo_config';

const clusterToColorMap: { [key: string]: string } = {};
let nextColorIndex = 0;

export function getNodeText(
  node: LeafNode,
  items: ApiItemMap,
  stats: AllNodeStats,
  config: RepoConfig
): string {
  const colorBy = config.nodeColorWeight;
  const sizeBy = config.nodeSizeWeight;

  const matches = [
    NODE_SIZE_WEIGHT_OPTIONS.ORG_SCORE,
    NODE_SIZE_WEIGHT_OPTIONS.INTER_DEPENDENCIES,
    NODE_SIZE_WEIGHT_OPTIONS.INTRA_DEPENDENCIES,
    NODE_SIZE_WEIGHT_OPTIONS.MAX_COUPLING_SCORE,
    NODE_SIZE_WEIGHT_OPTIONS.PUBLIC_API_COUNT,
  ];

  if (stats.stats[node.id].orgScore === undefined) {
    console.error(node);
    throw new Error('org score undefined');
  }

  const vals = [
    stats.stats[node.id].orgScore,
    stats.stats[node.id].interDependencyCount,
    stats.stats[node.id].intraDependencyCount,
    stats.stats[node.id].efferentCoupling,
    stats.stats[node.id].afferentCoupling,
    stats.stats[node.id].tightestConnectionWeight,
    stats.stats[node.id].publicAPICount,
  ];
  const maxVals = [
    stats.maxes.orgScore,
    stats.maxes.interDependencyCount,
    stats.maxes.intraDependencyCount,
    stats.maxes.efferentCoupling,
    stats.maxes.afferentCoupling,
    stats.maxes.tightestConnectionWeight,
    stats.maxes.publicAPICount,
  ];
  const minVals = [
    stats.mins.orgScore,
    stats.mins.interDependencyCount,
    stats.mins.intraDependencyCount,
    stats.mins.efferentCoupling,
    stats.mins.afferentCoupling,
    stats.mins.tightestConnectionWeight,
    stats.mins.publicAPICount,
  ];

  let color = 'black';
  if (colorBy === NODE_COLOR_WEIGHT_OPTIONS.COLOR_BY_CLUSTER) {
    if (node.parentId) {
      const parentId = items[node.parentId].id;
      if (!clusterToColorMap[parentId]) {
        clusterToColorMap[parentId] = CLUSTER_COLORS[nextColorIndex];
        nextColorIndex++;
        if (nextColorIndex >= CLUSTER_COLORS.length) nextColorIndex = 0;
      }
      color = clusterToColorMap[parentId];
    }
  } else {
    const colorByVal = getCorrectVal(colorBy, matches, vals);
    const colorByMaxVal = getCorrectVal(colorBy, matches, maxVals);
    const colorByMinVal = getCorrectVal(colorBy, matches, minVals);
    color = getWeightedColor(colorByVal, colorByMinVal, colorByMaxVal);
  }
  let scaledSize;
  let fontSize;

  const item = items[node.id];
  if (sizeBy) {
    const sizeByVal = getCorrectVal(sizeBy, matches, vals);
    const sizeByMaxVal = getCorrectVal(sizeBy, matches, maxVals);
    const sizeByMinVal = getCorrectVal(sizeBy, matches, minVals);
    scaledSize = getWeightedSize(sizeByVal, sizeByMinVal, sizeByMaxVal, 1, 5);

    // Such a crude way of scaling the font.
    let minFontSize = item.label.length > 10 ? 10 : 12;
    let maxFontSize = item.label.length > 10 ? 50 : 60;
    minFontSize = item.label.length > 20 ? 9 : minFontSize;
    maxFontSize = item.label.length > 20 ? 30 : maxFontSize;
    fontSize = getWeightedSize(sizeByVal, sizeByMinVal, sizeByMaxVal, minFontSize, maxFontSize);
  }

  const properties = getNodeProperties(getLabel(item.label), color, scaledSize, fontSize);

  return `${getSafeName(node.id)} [${properties}]\n`;
}

function getCorrectVal(configVal: string, matches: string[], vals: Array<number>): number {
  for (let i = 0; i < matches.length; i++) {
    if (matches[i] === configVal) {
      return vals[i];
    }
  }

  throw new Error(`${configVal} in ${matches} not found.`);
}

export function getNodesText(
  node: ParentNode | LeafNode,
  items: ApiItemMap,
  stats: AllNodeStats,
  config: RepoConfig,
  level = 0
): string {
  let text = '';

  if (!isParentNode(node)) {
    text += getNodeText(node, items, stats, config) + '\n';
  } else {
    const color = getColorForLevel(level);

    if (node.children.length > 0) {
      text += `
subgraph cluster_${getSafeName(node.id)} {
style=filled
fontsize="50"
color="${color}"  
label="${getLabel(items[node.id].label)}"
`;

      node.children.forEach((child) => {
        if (isLeafNode(child)) {
          text += getNodeText(child, items, stats, config);
        } else {
          text += getNodesText(child, items, stats, config, level + 1);
        }
        +'\n';
      });

      text += '}\n';
    }
  }

  return text;
}
