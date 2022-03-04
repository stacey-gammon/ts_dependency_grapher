import { LeafNode, ParentNode, GVEdgeMapping } from './types';
import { OutputImageMapping } from '../../types/image_types';
import { zoomOut } from './zoom/zoom_out';
import { getNodeStats } from './stats/get_node_stats';
import Path from 'path';
import { generateCSVs } from './generate_csv';
import { buildDotFile } from '../dot_builder';
import { RepoConfig } from '../../config/repo_config';
import { buildPngs } from '../graph_vis/build_pngs';
import { recommendClustering } from './clustering/recommend_clustering';
import { AllNodeStats } from './stats/types';
import { ApiItemMap } from './types/node_types';

/**
 *
 * @param fileNamePrefix - A file name prefix to use for the generated image.
 */
export async function runDependencyAlgorithms({
  zoom,
  root,
  edges,
  fileNamePrefix,
  repoInfo,
  repoImages,
  items,
}: {
  zoom?: number;
  items: ApiItemMap;
  root: ParentNode | LeafNode;
  edges: GVEdgeMapping;
  fileNamePrefix: string;
  repoInfo: RepoConfig;
  repoImages: OutputImageMapping;
}) {
  if (zoom) {
    console.log(`Zooming out to level ${zoom}`);
    const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, items, edges, zoom);
    edges = zoomedOutEdges;
    root = zoomedOutRoot;
  }

  const beforeAndAfter = repoInfo.takeRecommendations ? [false, true] : [undefined];

  for (const takeRecommendations of beforeAndAfter) {
    const outputId = getOutputFileName(fileNamePrefix, takeRecommendations, zoom);
    let stats = getNodeStats(root, items, edges);

    if (takeRecommendations && stats.recommendations) {
      recommendClustering({ outputId, root, edges, items });
      stats = getNodeStats(root, items, edges);
    }

    console.log(`Building graphs for ${outputId} at zoom level ${zoom}`);

    const imageInfos = await buildGraph({
      fileNamePrefix: outputId,
      repoInfo,
      root,
      items,
      edges,
      stats,
    });

    if (repoImages) {
      if (!repoImages[repoInfo.fullName]) {
        repoImages[repoInfo.fullName] = { images: [], repoInfo };
      }

      imageInfos.forEach((imageInfo) => {
        repoImages[repoInfo.fullName].images.push({
          ...imageInfo,
          zoom: zoom ? zoom.toString() : undefined,
          moveRecommendationsCount: stats.recommendations.length,
        });
      });
    }
  }
}

function getOutputFileName(name: string, takeRecommendations?: boolean, zoom?: number) {
  let uniqueName = name;
  if (zoom !== undefined) {
    uniqueName += `_zoom${zoom}`;
  }
  if (takeRecommendations != undefined) {
    uniqueName += `_${takeRecommendations ? 'after' : 'before'}`;
  }

  return uniqueName;
}

function buildGraph({
  fileNamePrefix,
  root,
  edges,
  items,
  repoInfo,
  stats,
}: {
  repoInfo: RepoConfig;
  fileNamePrefix: string;
  root: ParentNode | LeafNode;
  items: ApiItemMap;
  edges: GVEdgeMapping;
  stats: AllNodeStats;
}) {
  generateCSVs(root, items, edges, fileNamePrefix, stats);

  const dotOutputPath = Path.resolve(repoInfo.outputFolder, `${fileNamePrefix}.dot`);

  buildDotFile(edges, root, items, dotOutputPath, repoInfo, stats);

  return buildPngs({
    fileNamePrefix,
    dotPath: dotOutputPath,
    repoInfo,
  });
}
