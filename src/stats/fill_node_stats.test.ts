import { parseDependencies } from '../dependency_parsing/parse_dependencies';
import Path from 'path';
import { isLeafNode } from '../zoom/zoom_out';
import { fillNodeStats } from '../stats/fill_node_stats';
import { removeCircularDependenciesFromEdges } from '../remove_node_circular_deps';

it('fillNodeStats well organized', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/well_organized/tsconfig.json'),
    refresh: true,
  });

  const stats = fillNodeStats(root, edges);

  const a3Edge = edges['_A_3_ts'];
  const a3Source = stats.stats['_A_3_ts'];

  expect(a3Source).toBeDefined();
  expect(a3Edge).toBeDefined();
  expect(a3Edge.destinations.length).toBe(3);
  expect(a3Source.intraDependencyCount).toBe(1);
  expect(a3Source.interDependencyCount).toBe(2);
  expect(a3Source.afferentCoupling).toBe(0);
  expect(a3Source.efferentCoupling).toBe(1);
  expect(a3Source.maxSingleCoupleWeight).toBe(1);
  expect(a3Source.orgScore).toBe(1);

  const b6Stats = stats.stats['_B_6_ts'];
  expect(b6Stats.intraDependencyCount).toBe(2);
  expect(b6Stats.interDependencyCount).toBe(2);
  expect(b6Stats.afferentCoupling).toBe(1);
  expect(b6Stats.efferentCoupling).toBe(1);
});

it.only('fillNodeStats poor organized', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/poor_organized/tsconfig.json'),
    refresh: true,
  });

  const stats = fillNodeStats(root, edges);

  const threeSource = stats.stats['_B_3_ts'];

  removeCircularDependenciesFromEdges(edges);
  expect(threeSource.intraDependencyCount).toBe(3);
  expect(threeSource.interDependencyCount).toBe(0);
  expect(threeSource.afferentCoupling).toBe(0);
  expect(threeSource.efferentCoupling).toBe(3);

  expect(threeSource.maxSingleCoupleWeight).toBe(2);
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
