import Path from 'path';
import fs from 'fs';
import { getDiGraphText } from './build_digraph_text';
import { parseDependencies } from '../dependency_builder/dependency_parsing';
import { getNodeStats } from '../dependency_builder/stats/get_node_stats';
import { getTSMorphProject } from '../../get_tsmorph_project';
import { RepoConfig } from '../../config/repo_config';
import { getConfig } from '../../config';
import { resolveRepoConfigInput } from '../repo';

function getRepoInfo(tsconfigPath: string): RepoConfig {
  const fullPath = Path.resolve(__dirname, tsconfigPath);
  return resolveRepoConfigInput(
    {
      fullName: 'test',
      tsconfig: fullPath,
      layoutEngines: [],
      clearCache: true,
    },
    getConfig()
  );
}

it('create test png', () => {
  const TS_CONFIG = './__fixtures__/tsconfig.json';
  const project = getTSMorphProject(TS_CONFIG);
  const repoInfo = getRepoInfo(TS_CONFIG);

  const { edges, items, root } = parseDependencies({
    repoInfo,
    project,
  });
  const maxes = getNodeStats(root, items, edges);
  const text = getDiGraphText(edges, root, items, maxes);
  expect(text).toBeDefined();
  expect(text?.indexOf('bar_zed_lag')).toBeLessThan(0);
  fs.writeFileSync(Path.resolve(__dirname, 'test.dot'), text!);
});
