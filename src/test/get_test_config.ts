import { intializeConfig } from '../config';
import { Config, ConfigInput } from '../config/config';
import Path from 'path';

export function getTestConfig(tsconfigPath: string, input?: ConfigInput): Config {
  const fullPath = Path.resolve(__dirname, tsconfigPath);
  const configInput: ConfigInput = input || {
    repos: [
      {
        fullName: 'test',
        tsconfig: fullPath,
        layoutEngines: [],
        clearCache: true,
      },
    ],
  };
  return intializeConfig(configInput);
}
