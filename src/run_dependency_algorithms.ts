import { LeafNode, ParentNode } from './types/types';
import { GVEdgeMapping } from './types/edge_types';
import { OutputImageMapping } from './types/image_types';
import { zoomOut } from './zoom/zoom_out';
import { getNodeStats } from './stats/get_node_stats';
import Path from 'path';
import { generateCSVs } from './generate_csv';
import { buildDotFile } from './graph_vis/build_dot_file';
import { EntryInfo, RepoInfo } from './config/repo_config_settings';
import { buildPngs } from './graph_vis/build_pngs';
import { recommendClustering } from './clustering/recommend_clustering';
import { getConfig } from './config';

export function runDependencyAlgorithms({
  zoom,
  root,
  edges,
  name,
  repoInfo,
  repoImages,
}: {
  zoom?: number;
  root: ParentNode | LeafNode;
  edges: GVEdgeMapping;
  name: string;
  repoInfo: RepoInfo;
  repoImages: OutputImageMapping;
}) {
  if (zoom) {
    console.log(`Zooming out to level ${zoom}`);
    const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, edges, zoom);
    edges = zoomedOutEdges;
    root = zoomedOutRoot;
  }

  const config = getConfig();
  const beforeAndAfter = config.takeRecommendations ? [false, true] : [undefined];
  for (const takeRecommendations of beforeAndAfter) {
    const outputId = getOutputFileName(name, takeRecommendations, zoom);
    let stats = getNodeStats(root, edges);

    if (takeRecommendations && stats.recommendations) {
      recommendClustering({ outputId, root, edges });
      stats = getNodeStats(root, edges);
    }

    generateCSVs(root, edges, outputId, stats);

    console.log(`Generating dot file for ${outputId} at zoom level ${zoom}`);

    const dotOutputPath = Path.resolve(config.outputFolder, `${outputId}.dot`);

    buildDotFile(edges, root, dotOutputPath, repoInfo, stats);

    buildPngs({
      name: outputId,
      zoom,
      dotPath: dotOutputPath,
      repoInfo,
      repoImages,
      moveRecommendationsCount: stats.recommendations.length,
    });
  }
}

function getOutputFileName(
  name: string,
  takeRecommendations?: boolean,
  zoom?: number,
  entry?: EntryInfo
) {
  let uniqueName = name;
  if (entry != undefined) {
    uniqueName += `_${entry.name}`;
  }
  if (zoom !== undefined) {
    uniqueName += `_zoom${zoom}`;
  }
  if (takeRecommendations != undefined) {
    uniqueName += `_${takeRecommendations ? 'after' : 'before'}`;
  }

  return uniqueName;
}
