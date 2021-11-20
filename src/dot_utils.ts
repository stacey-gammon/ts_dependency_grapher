import { getClusteredNodeForFolder } from './folder_to_clustered_node';
import { rollupEdges } from './rollup_edges';
import {  getColorForLevel, getNodeProperties, getRelativeSizeOfNode, getWeightedColor, getWeightedSize } from './styles';
import { ClusteredNode, File, Folder, GVEdgeMapping, GVNode } from './types';
import { isGVNode, isGVNodeArray, zoomOut} from './zoom_out';

export function getDiGraphText(edges: GVEdgeMapping, folder: Folder, zoom: number) {
  const leafToParentId: { [key: string]: string } = {};
  const parentIdToLeaf: { [key: string]: string[] } = {};

  const cluster = zoomOut(getClusteredNodeForFolder(folder), edges, leafToParentId, parentIdToLeaf, 0, zoom) as ClusteredNode;

  const rolledUpEdges = rollupEdges(edges, leafToParentId);

  const maxPublicApiSize = findMaxVal(cluster, 0, 'publicAPICount');
  const maxIncomingDependencyCount = findMaxVal(cluster, 0, 'incomingDependencyCount');

  console.log('maxIncomingDependencyCount is ' + maxIncomingDependencyCount);
  return `digraph test{
      ${getNodesText(cluster, 0, { maxPublicApiSize, maxIncomingDependencyCount })}
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


  console.log('MAX DEST WEIGHT IS ' + maxWeight);
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
      const weight = getWeightedSize(dest.weight, maxWeight, 10, 2);
      console.log(`Weight for ${dest.weight} out of max ${maxWeight} is ${weight}`)
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
              publicAPICount: 0
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
  
function getNodeText(node: GVNode, { maxPublicApiSize, maxIncomingDependencyCount } : {maxIncomingDependencyCount: number, maxPublicApiSize: number }): string {
  const color = getWeightedColor(node.incomingDependencyCount, maxIncomingDependencyCount);
  const scaledSize = getRelativeSizeOfNode(node.publicAPICount, maxPublicApiSize);
  const properties = getNodeProperties(node.label, color, scaledSize);
  return `${getSafeName(node.id)} [${properties}]\n`
}
  
export function getNodesText(node: ClusteredNode, level = 0, maxes : { maxIncomingDependencyCount: number, maxPublicApiSize: number }): string {
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
        text += getNodeText(child, maxes) + '\n'
      })
    } else {
      node.children.forEach(child => {
        text += getNodesText(child, level + 1, maxes); + '\n'
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
