import Path from 'path';
import fs from 'fs';
import { getDiGraphText } from '../src/graph_vis/build_digraph_text';
import { parseDependencies } from '../src/ts_morph/parse_dependencies';

it('create test png', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, './__fixtures__/tsconfig.json'),
  });
  const text = getDiGraphText(edges, root);
  expect(text).toBeDefined();
  expect(text?.indexOf('bar_zed_lag')).toBeLessThan(0);
  fs.writeFileSync(Path.resolve(__dirname, 'test.dot'), text!);
});
