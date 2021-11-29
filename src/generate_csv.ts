import { GVEdgeMapping, LeafNode, NodeStats, ParentNode } from './types';
import fs from 'fs';
import { isLeafNode } from './zoom/zoom_out';
import nconf from 'nconf';
import Path from 'path';
import { AllNodeStats } from './stats/types';

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
    'maxSingleCoupleWeight',
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
  fs.writeFileSync(Path.resolve(nconf.get('outputFolder'), `${name}_nodes.csv`), csvText);

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
  fs.writeFileSync(Path.resolve(nconf.get('outputFolder'), `${name}_edges.csv`), edgeCsvText);
}

function addRows(
  node: ParentNode | LeafNode,
  rows: Array<Array<string | number>>,
  columns: Array<keyof NodeStats | 'filePath' | 'complexityScore'>,
  stats: AllNodeStats
) {
  if (isLeafNode(node)) {
    rows.push(
      columns.map((col) =>
        col === 'filePath' || col === 'complexityScore' ? node[col] : stats.stats[node.id][col]
      )
    );
  }

  if (!isLeafNode(node)) {
    node.children.forEach((child) => addRows(child, rows, columns, stats));
  }
}
