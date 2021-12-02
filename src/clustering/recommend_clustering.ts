import nconf from 'nconf';
import { CLUSTER_OPTION_ORG_SCORE } from '../config';
import { saveRecommendationsToFile } from '../stats/save_recommendations_to_file';
import Path from 'path';
import { AllNodeStats } from '../stats/types';
import { LeafNode, ParentNode } from '../types/types';
import { dbScanRecluster } from './db_scan_recluster';
import { GVEdgeMapping } from '../types/edge_types';
import { isLeafNode } from '../zoom/zoom_out';
import { getParentNode } from '../node.mock';
import { moveNode } from '../stats/move_node';
import { deCircularify } from '../utils';
import { orgScoreClustering } from './org_score_clustering';

export function recommendClustering({
  outputId,
  stats,
  root,
  edges,
}: {
  outputId: string;
  stats: AllNodeStats;
  root: ParentNode | LeafNode;
  edges: GVEdgeMapping;
}) {
  const clusteringMethod = nconf.get('clusteringAlgo') || CLUSTER_OPTION_ORG_SCORE;

  if (clusteringMethod === CLUSTER_OPTION_ORG_SCORE) {
    orgScoreClustering(root, edges, stats.recommendations);

    saveRecommendationsToFile(
      Path.resolve(nconf.get('outputFolder'), `${outputId}_org_score_recommendations.md`),
      stats.recommendations,
      false
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
