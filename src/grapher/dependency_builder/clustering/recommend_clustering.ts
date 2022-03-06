import { saveRecommendationsToFile } from './save_recommendations_to_file';
import Path from 'path';
import { ApiItemMap, LeafNode, ParentNode } from '../types';
import { dbScanRecluster } from './db_scan_recluster';
import { GVEdgeMapping } from '../types/edge_types';
import { isParentNode } from '../utils';
import { getParentNode } from '../../../test/node.mock';
import { moveNode } from './move_node';
import { deCircularify } from '../../../utils';
import { Move, orgScoreClustering } from './org_score_clustering';
import { CLUSTERING_ALGOS, Config } from '../../../config/config';
import { RepoConfig } from '../../../config/repo_config';

export function recommendClustering({
  outputId,
  root,
  items,
  edges,
  config,
}: {
  outputId: string;
  root: ParentNode | LeafNode;
  items: ApiItemMap;
  edges: GVEdgeMapping;
  config: RepoConfig;
}) {
  if (config.clusteringAlgo === CLUSTERING_ALGOS.ORG_SCORE) {
    const movesMade: Array<Move> = [];
    orgScoreClustering(root, items, edges, movesMade);

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

    if (isParentNode(root)) {
      root.children = [];
      let index = 0;
      for (const cluster of newClusters) {
        const parent = getParentNode(index.toString(), items, root);
        root.children.push(parent);
        index++;
        cluster.forEach((node) => {
          moveNode(node, parent, root);
        });
      }
    }
  }
}
