import fs from 'fs';
import Path from 'path';
import nconf from 'nconf';


export function buildDocsSite(repoImages: { [key: string]: { [key: string]: string}}) {
  const text = `
# Architecture art

_Visualizing cohesion and coupling_



${Object.keys(repoImages).map(repo => buildDocSiteRepoSection(repo, repoImages[repo])).join('\n')}

`;

  const indexFilePath = Path.resolve(nconf.get('outputFolder'), 'index.md');

 fs.writeFileSync(indexFilePath, text);
}

function buildDocSiteRepoSection(repo: string, zoomImages: { [key: string]: string }): string {
  return `

## ${repo} dependency graphs

${Object.keys(zoomImages).map(zoom => buildDocSiteZoomSection(repo, zoom, zoomImages[zoom])).join('\n')}

`;
}

function buildDocSiteZoomSection(repo: string, zoomLevel: string, zoomImage: string): string {
  return `

### Zoom ${zoomLevel}

![${repo} dependency graph at zoom ${zoomLevel}](./${zoomImage})

`;
}