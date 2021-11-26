import Path from 'path';
import fs from 'fs';
import { getDiGraphText } from '../src/graph_vis/build_digraph_text';
import { parseDependencies } from '../src/dependency_parsing/parse_dependencies';
import { fillNodeStats } from '../src/stats/fill_node_stats';

it('create test png', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, './__fixtures__/tsconfig.json'),
    refresh: true,
  });
  const maxes = fillNodeStats(root, edges);
  const text = getDiGraphText(edges, root, maxes);
  expect(text).toBeDefined();
  expect(text?.indexOf('bar_zed_lag')).toBeLessThan(0);
  fs.writeFileSync(Path.resolve(__dirname, 'test.dot'), text!);
});
