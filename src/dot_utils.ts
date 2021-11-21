import { COLOR_NODE_BY_CONFIG_KEY, INCOMING_DEP_COUNT, MAX_COUPLING_SCORE, PUBLIC_API_COUNT, SIZE_NODE_BY_CONFIG_KEY } from './config';
import { collectNodeCouplingWeights, getMaxCoupledWeight, getTightestCoupledNodeCount } from './coupling_weights';
import { getClusteredNodeForFolder } from './folder_to_clustered_node';
import { rollupEdges } from './rollup_edges';
import {  getColorForLevel, getNodeProperties, getRelativeSizeOfNode, getWeightedColor, getWeightedSize } from './styles';
import { ClusteredNode, CouplingWeightMapping, File, Folder, GVEdgeMapping, GVNode, StatStructs } from './types';
import { isGVNode, isGVNodeArray, zoomOut} from './zoom_out';
import nconf from 'nconf';

interface MaxWeights {
  maxIncomingDependencyCount: number,
  maxPublicApiSize: number,
  maxNodeCouplingWeight: number
}

export function getDiGraphText(edges: GVEdgeMapping, folder: Folder, zoom: number, maxImageSize: number) {
  const leafToParentId: { [key: string]: string } = {};
  const parentIdToLeaf: { [key: string]: string[] } = {};

  const cluster = zoomOut(getClusteredNodeForFolder(folder), edges, leafToParentId, parentIdToLeaf, 0, zoom) as ClusteredNode;

  const { rolledUpEdges, innerDependencyCount } = rollupEdges(edges, leafToParentId);

  const couplingWeights = collectNodeCouplingWeights(rolledUpEdges);

  const maxPublicApiSize = findMaxVal(cluster, 0, 'publicAPICount');
  const maxIncomingDependencyCount = findMaxVal(cluster, 0, 'incomingDependencyCount');
  const maxNodeCouplingWeight = getMaxCoupledWeight(couplingWeights);

  console.log('maxIncomingDependencyCount is ' + maxIncomingDependencyCount);
  return `digraph test{
      ratio="compress";
      size="${maxImageSize}, ${maxImageSize}!";
      ${getNodesText(cluster, { maxPublicApiSize, maxIncomingDependencyCount, maxNodeCouplingWeight }, { innerDependencyCount, couplingWeights })}
       ${getDependenciesText(rolledUpEdges)}
    }`;
}

function findMaxVal(node: ClusteredNode | GVNode, max: number = 0, key: keyof GVNode): number {
  if (isGVNode(node)) {
    const val: number = node[key] as number;
   return val > max ? val : max;
  } else {
    let maxChild = max;
    node.children.forEach(child => {
      const childSize = findMaxVal(child, maxChild, key);
      if (childSize > maxChild) {
        maxChild = childSize;
      }
    });
    return maxChild;
  }
}

   
function getDependenciesText(
  edges: GVEdgeMapping
) {

  const maxWeight = Object.values(edges).reduce((max, dests) => {
    return dests.reduce((innerMax, dest) => {
      return dest.weight > innerMax ? dest.weight : innerMax;
    }, max)
  }, 0);

  let text = '';
  Object.keys(edges).forEach((source) => {
    if (!source) {
      console.error(edges);
      throw new Error('getDependenciesText: source not defined in edges!');
    }
    const dests = edges[source];
    dests.forEach(dest => {
      if (!dest.dest) {
        console.error(dest);
        console.error(edges);
        throw new Error('getDependenciesText: dest.dest not defined!');
      }
      const color = getWeightedColor(dest.weight, maxWeight);
      const weight = getWeightedSize(dest.weight, maxWeight, 15, 2);
      text += `${getSafeName(source)} -> ${getSafeName(dest.dest)} ${
        dest.weight ? `[color="${color}" penwidth=${weight}]` : ''
      }\n`;
    });
  });
  return text;
}

export function addFileToTree(filePath: string, root: Folder): File {
  console.log('Adding ' + filePath + ' to root');
  const folderNames = filePath.split(/[\\/]/gi);
  let level: Folder = root;
  let pathAccrued = '';
  for (let i = 0; i < folderNames.length; i++) {
    const name = folderNames[i];
    if (name === '' || name === undefined) continue;
    if (i === folderNames.length - 1) {
      if (!level.files[name]) {
        level.files[name] = {
          path: pathAccrued + '/' + name,
          name,
          exports: [
            {
              id: getSafeName(pathAccrued + '/' + name + '_NoName'),
              label: 'index',
              incomingDependencyCount: 0,
              publicAPICount: 0,
              innerNodeCount: 0
            }
          ]
        }
      }
      return level.files[name];
    } else {
      if (!level.folders[name]) {
        level.folders[name] = {
          path: pathAccrued + '/' + name,
          name,
          files: {},
          folders: {},   
        }
      }
      pathAccrued = pathAccrued + '/' + name;
      level = level.folders[name];
    }
  }

  throw new Error('Reached end and never returned a file.');
}
  
function getNodeText(
    node: GVNode,
    { maxPublicApiSize, maxIncomingDependencyCount, maxNodeCouplingWeight } : MaxWeights,
    statStructs: StatStructs): string {

  const colorBy = nconf.get(COLOR_NODE_BY_CONFIG_KEY);
  const sizeBy = nconf.get(SIZE_NODE_BY_CONFIG_KEY);

  const maxCouplingWeight = getTightestCoupledNodeCount(node.id, statStructs.couplingWeights);
  const innerNodeConnectionCount = statStructs.innerDependencyCount[node.id] || 1;
  const cohesion = node.innerNodeCount === 1 ? 1 : innerNodeConnectionCount / (node.innerNodeCount * node.innerNodeCount);

  console.log(`----Node ${node.id}------`);
  console.log(`Max coupling weight: ${maxCouplingWeight} / ${maxNodeCouplingWeight}`);
  console.log(`Cohesion score: ${cohesion} / ?`);
  console.log(`Incoming dependency weight: ${node.incomingDependencyCount} / ${maxIncomingDependencyCount}`);
  console.log(`Public API count: ${node.publicAPICount} / ${maxPublicApiSize}`);
  console.log(`Inner node count: ${node.innerNodeCount} / ?`);

  const matches = [INCOMING_DEP_COUNT, MAX_COUPLING_SCORE, PUBLIC_API_COUNT];
  const vals = [node.incomingDependencyCount, maxCouplingWeight, node.publicAPICount];
  const maxVals = [maxIncomingDependencyCount, maxNodeCouplingWeight, maxPublicApiSize];

  const colorByVal = getCorrectVal(colorBy, matches, vals);
  const colorByMaxVal = getCorrectVal(colorBy, matches, maxVals);
  const sizeByVal = getCorrectVal(sizeBy, matches, vals);
  const sizeByMaxVal = getCorrectVal(sizeBy, matches, maxVals);

  console.log( `colorByVal: ${colorByVal}, maxColorByVal: ${colorByMaxVal}`)
  console.log( `sizeByVal: ${sizeByVal}, sizeByMaxVal: ${sizeByMaxVal}`)

  console.log(`node ${node.id} has innerNodeCount of ${node.innerNodeCount} and inner dependency count of ${innerNodeConnectionCount} equaling cohesion of ${cohesion}`);

  const color = getWeightedColor(colorByVal, colorByMaxVal);
  const scaledSize = getWeightedSize(sizeByVal, sizeByMaxVal, 6, 16);
  const fontSize = getWeightedSize(sizeByVal, sizeByMaxVal, 50, 150);
  const properties = getNodeProperties(node.label, color, scaledSize);


  console.log( `scaledSize: ${scaledSize}`)

  return `${getSafeName(node.id)} [${properties} fontsize="${fontSize}"]\n`
}

function getCorrectVal(configVal: string, matches: string[], vals: Array<number>): number {
  let indexInVal = 0;

  for (const match of matches) {
    if (match === configVal) { 
      return vals[indexInVal];
    } else {
      console.log(`${match} != ${configVal}`)
    }
    indexInVal++;
  };

  return 1;
}
  
export function getNodesText(
    node: ClusteredNode,
    maxes: MaxWeights,
    statStructs: StatStructs,
    level = 0,): string {
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
      node.children.forEach(child => {
        text += getNodeText(child, maxes, statStructs) + '\n'
      })
    } else {
      node.children.forEach(child => {
        text += getNodesText(child, maxes, statStructs, level + 1, ); + '\n'
      })
    }
    text += '}\n';
  }

  return text;
}
    
export function getSafeName(name: string): string {
  if (!name) {
    throw new Error('getSafeName: Name not defined!');
  }
  return name === 'graph' ? 'graph1' : name.replace(/[ /\-.@]/gi, '_');
}
