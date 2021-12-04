import { ConfigOptions } from './config';
import { NODE_WEIGHT_OPTIONS, NODE_COLOR_WEIGHT_OPTIONS } from './node_weight_options';

export function validateConfig(config: ConfigOptions) {
  if (!config.repos) {
    throw new Error('Config repos option is required');
  }
  if (!(config.repos instanceof Array)) {
    throw new Error('Config repos option is not an Array');
  }

  if (config.nodeSizeWeight) {
    throwIfNotOneOf(config.nodeSizeWeight, Object.values(NODE_WEIGHT_OPTIONS));
  }
  if (config.nodeColorWeight) {
    throwIfNotOneOf(config.nodeColorWeight, Object.values(NODE_COLOR_WEIGHT_OPTIONS));
  }
}

function throwIfNotOneOf(key: string, options: string[]) {
  if (key && !options.includes(key)) {
    throw new Error(`ERROR: ${key} is not one of:
    ${options.join('\n')}`);
  }
}
