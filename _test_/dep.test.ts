import Path from 'path';
import fs from 'fs';
import { getDiGraphText } from '../src/graph_vis/build_digraph_text';
import { parseDependencies } from '../src/dependency_parsing/parse_dependencies';
import { getNodeStats } from '../src/stats/get_node_stats';
import { getTSMorphProject } from '../src/get_tsmorph_project';

function getRepoInfo(tsconfigPath: string) {
  const fullPath = Path.resolve(__dirname, tsconfigPath);
  return { full_name: 'test', tsconfig: fullPath, clearCache: true, layoutEngines: [] };
}

it('create test png', () => {
  const repoInfo = getRepoInfo('./__fixtures__/tsconfig.json');
  const project = getTSMorphProject(repoInfo);
  const { edges, root } = parseDependencies({
    repoInfo,
    project,
  });
  const maxes = getNodeStats(root, edges);
  const text = getDiGraphText(edges, root, maxes);
  expect(text).toBeDefined();
  expect(text?.indexOf('bar_zed_lag')).toBeLessThan(0);
  fs.writeFileSync(Path.resolve(__dirname, 'test.dot'), text!);
});
