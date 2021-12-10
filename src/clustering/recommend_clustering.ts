import { saveRecommendationsToFile } from './save_recommendations_to_file';
import Path from 'path';
import { LeafNode, ParentNode } from '../types/types';
import { dbScanRecluster } from './db_scan_recluster';
import { GVEdgeMapping } from '../types/edge_types';
import { isLeafNode } from '../zoom/zoom_out';
import { getParentNode } from '../node.mock';
import { moveNode } from './move_node';
import { deCircularify } from '../utils';
import { Move, orgScoreClustering } from './org_score_clustering';
import { CLUSTERING_ALGOS } from '../config/config';
import { getConfig } from '../config';

export function recommendClustering({
  outputId,
  root,
  edges,
}: {
  outputId: string;
  root: ParentNode | LeafNode;
  edges: GVEdgeMapping;
}) {
  const clusteringMethod = getConfig().clusteringAlgo;
  const config = getConfig();
  if (clusteringMethod === CLUSTERING_ALGOS.ORG_SCORE) {
    const movesMade: Array<Move> = [];
    orgScoreClustering(root, edges, movesMade);

    saveRecommendationsToFile(
      Path.resolve(config.outputFolder, `${outputId}_org_score_recommendations.md`),
      movesMade,
      config.recommendationFileType === 'csv'
    );
  } else {
    const newClusters: Array<Array<LeafNode>> = [];
    const noiseNodes: Array<LeafNode> = [];
    dbScanRecluster(root, edges, newClusters, noiseNodes);
    if (noiseNodes.length > 0) {
      newClusters.push(noiseNodes);
    }
    console.log(
      `Returned ${newClusters.length} clusters with the following sizes: ${newClusters
        .map((c) => c.length)
        .join(',')}`
    );
    console.log('New clusters are ', JSON.stringify(newClusters, deCircularify, 2));

    if (!isLeafNode(root)) {
      root.children = [];
      let index = 0;
      for (const cluster of newClusters) {
        const parent = getParentNode(index.toString(), root);
        root.children.push(parent);
        index++;
        cluster.forEach((node) => {
          moveNode(node, parent);
        });
      }
    }
  }
}
