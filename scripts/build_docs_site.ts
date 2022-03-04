import { run } from '../src/index';
import nconf from 'nconf';

export async function main() {
  //   nconf.set('configFile', 'config/config.json');
  //   await run();

  nconf.set('configFile', 'config/tsdep-config-org.json');
  await run();
}

main();
