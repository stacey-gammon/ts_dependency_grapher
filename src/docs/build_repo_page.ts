import { ImagesForRepoConfig, ImageInfo } from '../types/image_types';
import { convertConfigRelativePathToAbsolutePath, getRootRelativePath } from '../utils';
import { buildMdTabs } from './build_tabs';
import { RepoHeaderItem } from './types';
import nconf from 'nconf';
import { writeIndexFile } from './write_file';

export function buildRepoPage(repo: ImagesForRepoConfig, headerItems: Array<RepoHeaderItem>) {
  const text = `
    ---
    title: Architecture art
    author: Stacey Gammon
    ---
    
    # Architecture art examples
    
    _Visualizing cohesion and coupling_
    
    ${buildMdTabs(repo.repoInfo.outputName, headerItems)}
    
    ${buildDocSiteRepoSection(repo)}`;

  writeIndexFile(nconf.get('outputFolder'), text);
}

function buildDocSiteRepoSection(repo: ImagesForRepoConfig): string {
  return `
  Configuration:
  \`\`\`
  ${JSON.stringify(repo.repoInfo, null, 2)}
  \`\`\`
  ${repo.images.map((image) => buildDocSiteZoomSection(repo.repoInfo.fullName, image)).join('\n')}
  `;
}

function buildDocSiteZoomSection(repo: string, image: ImageInfo): string {
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
