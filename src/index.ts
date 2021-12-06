import nconf from 'nconf';
import { buildDocsSite } from './build_docs_site';
import { RepoInfo } from './config/repo_config_settings';
import { runOnRepo } from './run_on_repo';
import { OutputImageMapping } from './types/image_types';
import fs from 'fs';
import { DEFAULT_CONFIG } from './config/defaults';
import { validateConfig } from './config/validate_config';
import { getConfig } from './config';

export async function main() {
  nconf.argv().env();
  const configFile = nconf.get('configFile') || 'config/config.json';

  if (!fs.existsSync) {
    throw new Error(`Config file ${configFile} cannot be found.`);
  }

  nconf.file({ file: configFile }).defaults(DEFAULT_CONFIG);

  const config = getConfig();
  validateConfig(config);

  const repoImages: OutputImageMapping = {};
  const repos: Array<RepoInfo> = config.repos;

  for (const repoInfo of repos) {
    repoInfo.layoutEngines = repoInfo.layoutEngines || [{ name: 'sfdp' }, { name: 'fdp' }];
    await runOnRepo(repoInfo, repoImages);
  }

  if (nconf.get('buildDocsSite') && repoImages) {
    buildDocsSite(repoImages);
  }
}

main();
