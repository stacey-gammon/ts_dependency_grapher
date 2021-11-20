import cmd from 'command-line-args';
import fs from 'fs';
import {  getDotFileText } from './build_dot'

interface CmdArgs {
  entry?: string;
  output: string;
  tsconfig: string;
  zoom: number;
}

const DEFAULT_ARGS = {
  zoom: 1
}

const optionDefinitions = [
  { name: 'entry', alias: 'e', type: String },
  { name: 'output', alias: 'o', type: String },
  { name: 'tsconfig', alias: 't', type: String },
  { name: 'zoom', alias : 'z', type: Number }
];

export function main() {
  const options: CmdArgs = { ...DEFAULT_ARGS, ...cmd(optionDefinitions) } as CmdArgs;

  if (!options.tsconfig) {
    throw new Error('tsconfig arg required');
  }

  const text = getDotFileText(options);
  if (!text) {
    throw new Error('Text not generated');
  }

  fs.writeFileSync(options.output, text);
}


main();