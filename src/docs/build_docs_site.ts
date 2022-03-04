import fs from 'fs';
import Path from 'path';
import nconf from 'nconf';
import { OutputImageMapping } from '../types/image_types';
import { buildMdTabs } from './build_tabs';
import { RepoHeaderItem } from './types';
import { buildRepoPage } from './build_repo_page';

export function buildDocsSite(allRepoImages: OutputImageMapping) {
  const headerItems: Array<RepoHeaderItem> = Object.keys(allRepoImages).map((repo) => ({
    name: repo,
    pagePath: `${repo}/${allRepoImages[repo].repoInfo.outputName}.html`,
  }));

  Object.keys(allRepoImages).forEach((repo) =>
    buildRepoPage(allRepoImages[repo], [
      { name: 'Home', pagePath: '../index.html' },
      ...headerItems,
    ])
  );

  const text = `
---
title: Architecture art
author: Stacey Gammon
---

# Architecture art examples

_Visualizing cohesion and coupling_

${buildMdTabs('Home', [{ name: 'Home', pagePath: './index.html' }, ...headerItems])}
`;

  const indexFilePath = Path.resolve(nconf.get('outputFolder'), 'index.md');

  fs.writeFileSync(indexFilePath, text);
}
