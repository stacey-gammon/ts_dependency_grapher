import nconf from 'nconf';
import { buildDocsSite } from './build_docs_site';
import { COLOR_NODE_BY_CONFIG_KEY, NODE_WEIGHT_OPTIONS, validateConfig } from './config';
import { RepoConfigSettings } from './types/repo_config_settings';
import { runOnRepo } from './run_on_repo';
import { OutputImageMapping } from './types/image_types';
import fs from 'fs';

export async function main() {
  nconf.argv().env();
  const configFile = nconf.get('configFile') || 'config/config.json';

  if (!fs.existsSync) {
    throw new Error(`Config file ${configFile} cannot be found.`);
  }

  nconf.file({ file: configFile }).defaults({
    outputFolder: 'docs',
    buildSite: false,
    [COLOR_NODE_BY_CONFIG_KEY]: NODE_WEIGHT_OPTIONS[0],
    zooms: undefined,
    entry: undefined,
  });

  validateConfig();
  const repoImages: OutputImageMapping = {};
  const repos: Array<RepoConfigSettings> = nconf.get('repos');

  for (const repoInfo of repos) {
    repoInfo.layoutEngines = repoInfo.layoutEngines || [{ name: 'sfdp' }, { name: 'fdp' }];
    await runOnRepo(repoInfo, repoImages);
  }

  if (nconf.get('buildDocsSite') && repoImages) {
    buildDocsSite(repoImages);
  }
}

main();
