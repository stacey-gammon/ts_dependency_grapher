import fs from 'fs';
import Path from 'path';
import nconf from 'nconf';
import { ImagesForRepoConfig, OutputImage, OutputImageMapping } from './types/image_types';
import { convertConfigRelativePathToAbsolutePath, getRootRelativePath } from './utils';

export function buildDocsSite(allRepoImages: OutputImageMapping) {
  const text = `
# Architecture art examples

_Visualizing cohesion and coupling_

${Object.keys(allRepoImages)
  .map((repo) => buildDocSiteRepoSection(repo, allRepoImages[repo]))
  .join('\n')}
`;

  const indexFilePath = Path.resolve(nconf.get('outputFolder'), 'index.md');

  fs.writeFileSync(indexFilePath, text);
}

function buildDocSiteRepoSection(repo: string, repoImages: ImagesForRepoConfig): string {
  return `
Configuration:
\`\`\`
${JSON.stringify(repoImages.repoInfo, null, 2)}
\`\`\`
${repoImages.images.map((image) => buildDocSiteZoomSection(repo, image)).join('\n')}
`;
}

function buildDocSiteZoomSection(repo: string, image: OutputImage): string {
  const relativeEntryFile = image.entry
    ? getRootRelativePath(
        convertConfigRelativePathToAbsolutePath(image.entry),
        nconf.get('REPO_ROOT')
      )
    : undefined;
  return `

 ${relativeEntryFile ? `Entry: ${relativeEntryFile}` : ''} 
 ${image.zoom ? `Zoom level: ${image.zoom}` : ''} 
 Layout engine: ${image.layoutEngine} 
 ${
   image.moveRecommendationsCount
     ? `After taking ${image.moveRecommendationsCount} move recommendations`
     : ''
 }

![${repo} dependency graph](./${image.path})
`;
}
