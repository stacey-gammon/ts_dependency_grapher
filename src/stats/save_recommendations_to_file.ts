import { RecommendationsList } from './types';
import fs from 'fs';

export function saveRecommendationsToFile(
  outputPath: string,
  recommendations: RecommendationsList,
  csv = true
) {
  console.log('writing rec file with ' + recommendations.length + ' to outputPath');
  let text = csv ? 'Node, New Parent\n' : '| Node | New Parent |\n|----|----|\n';

  recommendations.forEach((rec) => {
    text += csv
      ? `${rec.node.filePath} ,${rec.newParent.filePath}\n`
      : `| ${rec.node.filePath} | ${rec.newParent.filePath} |\n`;
  });

  fs.writeFileSync(outputPath, text);
}
