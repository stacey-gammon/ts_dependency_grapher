import { getConfig } from './config';

import { runGrapher } from './grapher';
import { OutputImageMapping } from './types/image_types';

export function run(): Promise<OutputImageMapping> {
  const config = getConfig();
  return runGrapher(config);
}
