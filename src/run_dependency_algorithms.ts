import { GVEdgeMapping, LeafNode, OutputImageMapping, ParentNode } from './types';
import { zoomOut } from './zoom/zoom_out';
import nconf from 'nconf';
import { fillNodeStats } from './stats/fill_node_stats';
import { saveRecommendationsToFile } from './stats/save_recommendations_to_file';
import Path from 'path';
import { generateCSVs } from './generate_csv';
import { buildDotFile } from './graph_vis/build_dot_file';
import { EntryInfo, RepoConfigSettings } from './config';
import { buildPngs } from './build_pngs';

export async function runDependencyAlgorithms({
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
    const stats = fillNodeStats(root, edges, takeRecommendations);

    if (takeRecommendations && stats.recommendations) {
      saveRecommendationsToFile(
        Path.resolve(nconf.get('outputFolder'), `${outputId}.md`),
        stats.recommendations,
        false
      );
    }

    generateCSVs(root, edges, outputId, stats);

    console.log(`Generating dot file for ${outputId} at zoom level ${zoom}`);

    const dotOutputPath = Path.resolve(nconf.get('outputFolder'), `${outputId}.dot`);

    await buildDotFile(edges, root, dotOutputPath, repoInfo, stats);

    await buildPngs({ name: outputId, zoom, dotPath: dotOutputPath, repoInfo, repoImages, entry });
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
    uniqueName += `_${takeRecommendations ? 'after' : 'before'}_`;
  }
  if (entry != undefined) {
    uniqueName += `_${entry.name}`;
  }
  return uniqueName;
}
