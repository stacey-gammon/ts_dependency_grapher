import cmd from 'command-line-args';
import fs from 'fs';
import {  getDotFileText } from './build_dot'

interface CmdArgs {
  entry: string;
  output: string;
  tsconfig: string;
}


const optionDefinitions = [
  { name: 'entry', alias: 'e', type: String },
  { name: 'output', alias: 'o', type: String },
  { name: 'tsconfig', alias: 't', type: String },
];

export function main() {
  const options: CmdArgs = cmd(optionDefinitions) as CmdArgs;

  if (!options.entry  || !options.tsconfig) {
    throw new Error('Use --entry and --tsconfig args');
  }

  const text = getDotFileText(options);
  if (!text) {
    throw new Error('Text not generated');
  }

  fs.writeFileSync(options.output, text);
}


main();