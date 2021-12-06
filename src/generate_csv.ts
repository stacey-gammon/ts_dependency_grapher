import { LeafNode, ParentNode } from './types/types';
import { NodeStats } from './types/node_stats';
import { GVEdgeMapping } from './types/edge_types';
import fs from 'fs';
import { isLeafNode } from './zoom/zoom_out';
import Path from 'path';
import { AllNodeStats } from './stats/types';
import { getConfig } from './config';

export function generateCSVs(
  root: ParentNode | LeafNode,
  edges: GVEdgeMapping,
  name: string,
  stats: AllNodeStats
) {
  const columns: Array<keyof NodeStats | 'filePath' | 'complexityScore'> = [
    'filePath',
    'interDependencyCount',
    'intraDependencyCount',
    'afferentCoupling',
    'efferentCoupling',
    'orgScore',
    'tightestConnectionWeight',
    'tightestConnectionParentId',
    'connections',
    'complexityScore',
  ];

  const rows: Array<Array<string | number>> = [];
  addRows(root, rows, columns, stats);

  console.log(
    `Total organization score: ${rows.reduce((sum, r) => {
      return sum + (r[5] as number);
    }, 0)}`
  );

  const colText = columns.join(',');
  const rowText = rows.map((row) => row.join(','));

  const csvText = `
${colText}
${rowText.join('\n')}
`;
  fs.writeFileSync(Path.resolve(getConfig().outputFolder, `${name}_nodes.csv`), csvText);

  const edgeCSVColText = 'source, destination, weight';

  const edgeRows = Object.values(edges).map(({ node: source, outgoing }) => {
    return outgoing
      .map(({ node, dependencyWeight }) => {
        return `${source.id}, ${node.id}, ${dependencyWeight}`;
      })
      .join('\n');
  });

  const edgeCsvText = `
${edgeCSVColText}
${edgeRows.join('\n')}
 `;
  fs.writeFileSync(Path.resolve(getConfig().outputFolder, `${name}_edges.csv`), edgeCsvText);
}

function addRows(
  node: ParentNode | LeafNode,
  rows: Array<Array<string | number>>,
  columns: Array<keyof NodeStats | 'filePath' | 'complexityScore'>,
  stats: AllNodeStats
) {
  if (isLeafNode(node)) {
    if (!stats.stats[node.id]) {
      console.error(`No stats found for ${node.id}`);
      return;
    }
    rows.push(
      columns.map((col) => {
        if (col === 'connections') return `"${stats.stats[node.id].connections}"`;
        return col === 'filePath' || col === 'complexityScore'
          ? node[col]
          : stats.stats[node.id][col];
      })
    );
  }

  if (!isLeafNode(node)) {
    node.children.forEach((child) => addRows(child, rows, columns, stats));
  }
}
