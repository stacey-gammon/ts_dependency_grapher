import fs from 'fs';
import Path from 'path';

import { LeafNode, ParentNode, GVEdgeMapping, ApiItemMap } from './types';
import { NodeStats } from './types/node_stats';
import { isParentNode } from './utils';
import { AllNodeStats } from '..';
import { getConfig } from '../../config';

export function generateCSVs(
  root: ParentNode | LeafNode,
  items: ApiItemMap,
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
  addRows(root, items, rows, columns, stats);

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
  items: ApiItemMap,
  rows: Array<Array<string | number>>,
  columns: Array<keyof NodeStats | 'filePath' | 'complexityScore'>,
  stats: AllNodeStats
) {
  if (!isParentNode(node)) {
    if (!stats.stats[node.id]) {
      console.error(`No stats found for ${node.id}`);
      return;
    }
    rows.push(
      columns.map((col) => {
        if (col === 'connections') return `"${stats.stats[node.id].connections}"`;
        return col === 'filePath' || col === 'complexityScore'
          ? items[node.id][col]
          : stats.stats[node.id][col];
      })
    );
  }

  if (isParentNode(node)) {
    node.children.forEach((child) => addRows(child, items, rows, columns, stats));
  }
}
