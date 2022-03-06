import Path from 'path';
import fs from 'fs';
import { getDiGraphText } from './build_digraph_text';
import { parseDependencies } from '../dependency_builder/dependency_parsing';
import { getNodeStats } from '../dependency_builder/stats/get_node_stats';
import { getTSMorphProject } from '../../get_tsmorph_project';
import { getTestConfig } from '../../test/get_test_config';

it('create test png', () => {
  const TS_CONFIG = Path.resolve(__dirname, '../../test/__fixtures__/tsconfig.json');
  const project = getTSMorphProject(TS_CONFIG);
  console.log('about to getTestConfig');
  const config = getTestConfig(TS_CONFIG);
  const repoConfig = config.repos[0];
  const { edges, items, root } = parseDependencies({
    repoInfo: repoConfig,
    project,
  });
  const maxes = getNodeStats(root, items, edges);
  const text = getDiGraphText(edges, root, items, maxes, repoConfig);
  expect(text).toBeDefined();
  expect(text?.indexOf('bar_zed_lag')).toBeLessThan(0);
  fs.writeFileSync(Path.resolve(__dirname, 'test.dot'), text);
});
