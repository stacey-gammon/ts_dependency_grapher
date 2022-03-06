import { Config, ConfigInput } from './config';
import nconf from 'nconf';
import { DEFAULT_CONFIG } from './defaults';
import { validateConfig } from './validate_config';
import fs from 'fs';
import { resolveRepoConfigInput } from '../grapher/repo';

export function intializeConfig(options?: Partial<ConfigInput>): Config {
  nconf.argv().env();
  nconf.overrides(options);

  console.log('options is ', options);
  const configFile = nconf.get('configFile');

  if (configFile) {
    if (!fs.existsSync(configFile)) {
      throw new Error(`Config file ${configFile} cannot be found.`);
    }
    nconf.file({ file: configFile });
  }
  nconf.defaults(DEFAULT_CONFIG);

  const config = nconf.get() as Config;

  validateConfig(config);

  return {
    ...config,
    repos: config.repos.map((repoConfig) => resolveRepoConfigInput(repoConfig, config)),
  };
}
