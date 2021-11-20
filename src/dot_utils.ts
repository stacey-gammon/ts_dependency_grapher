import { getClusteredNodeForFolder } from './folder_to_clustered_node';
import { rollupEdges } from './rollup_edges';
import {  getColorForLevel, getNodeProperties, getRelativeSizeOfNode, getWeightedColor } from './styles';
import { ClusteredNode, File, Folder, GVEdgeMapping, GVNode } from './types';
import { isGVNode, isGVNodeArray, zoomOut} from './zoom_out';

export function getDiGraphText(edges: GVEdgeMapping, folder: Folder, zoom: number) {
  const leafToParentId: { [key: string]: string } = {};
  const parentIdToLeaf: { [key: string]: string[] } = {};

  const cluster = zoomOut(getClusteredNodeForFolder(folder), edges, leafToParentId, parentIdToLeaf, 0, zoom) as ClusteredNode;

  const rolledUpEdges = rollupEdges(edges, leafToParentId);

  const maxPublicApiSize = findMaxPublicApiSize(cluster);

  return `digraph test{
      ${getNodesText(cluster, 0, maxPublicApiSize)}
       ${getDependenciesText(rolledUpEdges)}
    }`;
}

function findMaxPublicApiSize(node: ClusteredNode | GVNode, max: number = 0): number {
  if (isGVNode(node)) {
   return node.publicAPICount > max ? node.publicAPICount : max;
  } else {
    let maxChild = max;
    node.children.forEach(child => {
      const childSize = findMaxPublicApiSize(child, maxChild);
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
      const color = getWeightedColor(dest.weight, 100);
      text += `${getSafeName(source)} -> ${getSafeName(dest.dest)} ${
        dest.weight ? `[color="${color}"]` : ''
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
  
function getNodeText(node: GVNode, maxPublicApiSize: number): string {
  const color = getWeightedColor(node.incomingDependencyCount, 10);
  const scaledSize = getRelativeSizeOfNode(node.publicAPICount, maxPublicApiSize);
  const properties = getNodeProperties(node.label, color, scaledSize);
  return `${getSafeName(node.id)} [${properties}]\n`
}
  
export function getNodesText(node: ClusteredNode, level = 0, maxPublicApiSize: number): string {
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
        text += getNodeText(child, maxPublicApiSize) + '\n'
      })
    } else {
      console.log('should be parent children!', node.children);
      node.children.forEach(child => {
        text += getNodesText(child, level + 1, maxPublicApiSize); + '\n'
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