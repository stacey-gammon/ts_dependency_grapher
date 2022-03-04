import { ConfigOptions } from './config';
import nconf from 'nconf';
import { DEFAULT_CONFIG } from './defaults';
import { validateConfig } from './validate_config';
import fs from 'fs';

export function getConfig(): ConfigOptions {
  nconf.argv().env();
  const configFile = nconf.get('configFile') || 'config/config.json';

  if (!fs.existsSync) {
    throw new Error(`Config file ${configFile} cannot be found.`);
  }

  nconf.file({ file: configFile }).defaults(DEFAULT_CONFIG);

  const config = getConfig();
  validateConfig(config);
  return nconf.get();
}
