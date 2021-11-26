import { GVEdgeMapping, LeafNode, ParentNode } from './types';
import fs from 'fs';
import { isLeafNode } from './zoom/zoom_out';
import nconf from 'nconf';
import Path from 'path';

export function generateCSVs(root: ParentNode | LeafNode, edges: GVEdgeMapping, name: string) {
  const columns: Array<keyof LeafNode> = [
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
  addRows(root, rows, columns);

  const colText = columns.join(',');
  const rowText = rows.map((row) => row.join(','));

  const csvText = `
${colText}
${rowText.join('\n')}
`;
  fs.writeFileSync(Path.resolve(nconf.get('outputFolder'), `${name}_nodes.csv`), csvText);

  const edgeCSVColText = 'source, destination, weight';

  const edgeRows = Object.values(edges).map(({ source, destinations }) => {
    return destinations
      .map(({ destinationNode, dependencyWeight }) => {
        return `${source.id}, ${destinationNode.id}, ${dependencyWeight}`;
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
  columns: Array<keyof LeafNode>
) {
  if (isLeafNode(node)) {
    rows.push(columns.map((col) => node[col]));
  }

  if (!isLeafNode(node)) {
    node.children.forEach((child) => addRows(child, rows, columns));
  }
}
