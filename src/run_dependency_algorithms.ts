import { LeafNode, ParentNode } from './types/types';
import { GVEdgeMapping } from './types/edge_types';
import { OutputImageMapping } from './types/image_types';
import { zoomOut } from './zoom/zoom_out';
import nconf from 'nconf';
import { getNodeStats } from './stats/get_node_stats';
import Path from 'path';
import { generateCSVs } from './generate_csv';
import { buildDotFile } from './graph_vis/build_dot_file';
import { EntryInfo, RepoConfigSettings } from './config/repo_config_settings';
import { buildPngs } from './build_pngs';
import { recommendClustering } from './clustering/recommend_clustering';

export function runDependencyAlgorithms({
  zoom,
  root,
  edges,
  name,
  repoInfo,
  repoImages,
  entry,
}: {
  zoom?: number;
  root: ParentNode | LeafNode;
  edges: GVEdgeMapping;
  name: string;
  repoInfo: RepoConfigSettings;
  repoImages: OutputImageMapping;
  entry?: EntryInfo;
}) {
  if (zoom) {
    console.log(`Zooming out to level ${zoom}`);
    const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, edges, zoom);
    edges = zoomedOutEdges;
    root = zoomedOutRoot;
  }

  const beforeAndAfter = nconf.get('takeRecommendations') ? [false, true] : [undefined];
  for (const takeRecommendations of beforeAndAfter) {
    const outputId = getOutputFileName(name, takeRecommendations, zoom, entry);
    let stats = getNodeStats(root, edges);

    if (takeRecommendations && stats.recommendations) {
      recommendClustering({ outputId, root, edges, stats });
      stats = getNodeStats(root, edges);
    }

    generateCSVs(root, edges, outputId, stats);

    console.log(`Generating dot file for ${outputId} at zoom level ${zoom}`);

    const dotOutputPath = Path.resolve(nconf.get('outputFolder'), `${outputId}.dot`);

    buildDotFile(edges, root, dotOutputPath, repoInfo, stats);

    buildPngs({ name: outputId, zoom, dotPath: dotOutputPath, repoInfo, repoImages, entry });
  }
}

function getOutputFileName(
  name: string,
  takeRecommendations?: boolean,
  zoom?: number,
  entry?: EntryInfo
) {
  let uniqueName = name;

  if (zoom !== undefined) {
    uniqueName += `_zoom${zoom}`;
  }
  if (takeRecommendations != undefined) {
    uniqueName += `_${takeRecommendations ? 'after' : 'before'}`;
  }
  if (entry != undefined) {
    uniqueName += `_${entry.name}`;
  }
  return uniqueName;
}
