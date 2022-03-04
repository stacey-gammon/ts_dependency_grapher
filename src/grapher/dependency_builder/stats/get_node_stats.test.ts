import { parseDependencies } from '../dependency_parsing/parse_dependencies';
import Path from 'path';
import { isLeafNode } from '../utils';
import { getNodeStats } from './get_node_stats';
import { createAndAddLeafNode, getParentNode } from '../../../test/node.mock';
import { LeafNode, ParentNode, GVEdgeMapping } from '../types';
import { getTSMorphProject } from '../../../get_tsmorph_project';
import { resolveRepoConfigInput } from '../../repo';
import { getConfig } from '../../../config';

function getRepoInfo(tsconfigPath: string) {
  const fullPath = Path.resolve(__dirname, tsconfigPath);
  return resolveRepoConfigInput(
    { fullName: 'test', tsconfig: fullPath, clearCache: true, layoutEngines: [] },
    getConfig()
  );
}

it('fillNodeStats well organized', () => {
  const repoInfo = getRepoInfo('../../examples/well_organized/tsconfig.json');
  const project = getTSMorphProject(repoInfo.tsconfig);
  const { edges, items, root } = parseDependencies({
    repoInfo,
    project,
  });

  const stats = getNodeStats(root, items, edges);

  const a3Edge = edges['_A_3_ts'];
  const a3Source = stats.stats['_A_3_ts'];

  expect(a3Source).toBeDefined();
  expect(a3Edge).toBeDefined();
  expect(a3Edge.outgoing.length).toBe(3);
  expect(a3Source.intraDependencyCount).toBe(1);
  expect(a3Source.interDependencyCount).toBe(2);
  expect(a3Source.afferentCoupling).toBe(0);
  expect(a3Source.efferentCoupling).toBe(1);
  expect(a3Source.tightestConnectionWeight).toBe(1);
  expect(a3Source.orgScore).toBe(1);

  const b6Stats = stats.stats['_B_6_ts'];
  expect(b6Stats.intraDependencyCount).toBe(2);
  expect(b6Stats.interDependencyCount).toBe(2);
  expect(b6Stats.afferentCoupling).toBe(1);
  expect(b6Stats.efferentCoupling).toBe(1);
});

it.only('fillNodeStats poor organized', () => {
  const repoInfo = getRepoInfo('../../examples/poor_organized/tsconfig.json');
  const project = getTSMorphProject(repoInfo);
  const { edges, root } = parseDependences({
    repoInfo,
    project,
  });

  const stats = getNodeStats(root, edges);

  const threeSource = stats.stats['_B_3_ts'];

  removeCircularDependenciesFromEdges(edges);
  expect(threeSource.intraDependencyCount).toBe(3);
  expect(threeSource.interDependencyCount).toBe(0);
  expect(threeSource.afferentCoupling).toBe(0);
  expect(threeSource.efferentCoupling).toBe(3);

  expect(threeSource.tightestConnectionWeight).toBe(2);
  expect(threeSource.orgScore).toBe(-2);

  const cSix = stats.stats['_C_6_ts'];
  expect(cSix.intraDependencyCount).toBe(4);
  expect(cSix.interDependencyCount).toBe(0);
  expect(cSix.afferentCoupling).toBe(1);
  expect(cSix.efferentCoupling).toBe(3);

  expect(isLeafNode(root)).toBe(false);
  if (!isLeafNode(root)) {
    const oneFolder = root.children.find((c) => c.id === '_A');
    expect(oneFolder).toBeDefined();
  }
});

it.only('fillNodeStats corner case check inter to see if should stay in self', () => {
  const root: ParentNode = getParentNode('root');
  const A: ParentNode = getParentNode('A', root);
  const B: ParentNode = getParentNode('B', root);
  const C: ParentNode = getParentNode('C', root);
  root.children = [A, B, C];

  const one: LeafNode = createAndAddLeafNode('1', A);
  const two: LeafNode = createAndAddLeafNode('2', B);
  const three: LeafNode = createAndAddLeafNode('3', B);
  const four: LeafNode = createAndAddLeafNode('4', C);

  // A/1 -> B/2 [3]
  // B/2 -> B/3 [2]
  // B/2 -> B/4 [4]

  const edges: GVEdgeMapping = {
    [one.id]: {
      node: one,
      incoming: [],
      outgoing: [
        {
          node: two,
          dependencyWeight: 3,
        },
      ],
    },
    [two.id]: {
      node: two,
      incoming: [],
      outgoing: [
        {
          node: three,
          dependencyWeight: 2,
        },
      ],
    },
    [three.id]: {
      node: three,
      incoming: [{ node: two, dependencyWeight: 2 }],
      outgoing: [],
    },
    [four.id]: {
      node: four,
      incoming: [{ node: two, dependencyWeight: 4 }],
      outgoing: [],
    },
  };

  A.children = [];

  const stats = getNodeStats(root, edges);

  const threeSource = stats.stats['_B_3_ts'];

  removeCircularDependenciesFromEdges(edges);
  expect(threeSource.intraDependencyCount).toBe(3);
  expect(threeSource.interDependencyCount).toBe(0);
  expect(threeSource.afferentCoupling).toBe(0);
  expect(threeSource.efferentCoupling).toBe(3);

  expect(threeSource.tightestConnectionWeight).toBe(2);
  expect(threeSource.orgScore).toBe(-2);

  const cSix = stats.stats['_C_6_ts'];
  expect(cSix.intraDependencyCount).toBe(4);
  expect(cSix.interDependencyCount).toBe(0);
  expect(cSix.afferentCoupling).toBe(1);
  expect(cSix.efferentCoupling).toBe(3);

  expect(isLeafNode(root)).toBe(false);
  if (!isLeafNode(root)) {
    const oneFolder = root.children.find((c) => c.id === '_A');
    expect(oneFolder).toBeDefined();
  }
});
