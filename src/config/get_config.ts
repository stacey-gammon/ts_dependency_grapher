import { ConfigOptions } from './config';
import nconf from 'nconf';

export function getConfig(): ConfigOptions {
  return nconf.get();
}
