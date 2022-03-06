import fs from 'fs';
import { Config } from './config';
import { NODE_SIZE_WEIGHT_OPTIONS, NODE_COLOR_WEIGHT_OPTIONS } from './node_weight_options';

export function validateConfig(config: Config) {
  if (!config.repos) {
    throw new Error('repos option is required');
  }
  if (!(config.repos instanceof Array)) {
    throw new Error('repos option is not an Array');
  }

  if (config.nodeSizeWeight) {
    throwIfNotOneOf(config.nodeSizeWeight, Object.values(NODE_SIZE_WEIGHT_OPTIONS));
  }
  if (config.nodeColorWeight) {
    throwIfNotOneOf(config.nodeColorWeight, Object.values(NODE_COLOR_WEIGHT_OPTIONS));
  }

  if (!fs.existsSync(config.repoCacheFolder)) {
    fs.mkdirSync(config.repoCacheFolder);
  }

  if (typeof config.excludeTypes !== 'boolean') {
    throw new Error(`excludeTypes must be of type boolean, instead it is ${config.excludeTypes}`);
  }
}

function throwIfNotOneOf(key: string, options: string[]) {
  if (key && !options.includes(key)) {
    throw new Error(`ERROR: ${key} is not one of:
    ${options.join('\n')}`);
  }
}
