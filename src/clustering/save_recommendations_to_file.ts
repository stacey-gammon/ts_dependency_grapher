import fs from 'fs';
import { Move } from './org_score_clustering';

export function saveRecommendationsToFile(
  outputPath: string,
  movesMade: Array<Move>,
  csv?: boolean
) {
  console.log('writing rec file with ' + movesMade.length + ' to outputPath');
  let text = csv
    ? 'Node, Old parent, New parent, description\n'
    : '| Node | Old parent | New parent | description | \n|----|----|\n';

  movesMade.forEach((move) => {
    text += csv
      ? `${move.node} ,${move.fromParent}, ${move.toParent}, "${move.description}" \n`
      : `| ${move.node} | ${move.fromParent} | ${move.toParent} | ${move.description}  |\n`;
  });

  fs.writeFileSync(outputPath, text);
}
