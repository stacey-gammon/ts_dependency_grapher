import { intializeConfig } from './config';

import { runGrapher } from './grapher';
import { OutputImageMapping } from './types/image_types';

export function run(): Promise<OutputImageMapping> {
  const config = intializeConfig();
  return runGrapher(config);
}
