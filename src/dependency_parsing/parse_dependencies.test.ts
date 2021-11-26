import { parseDependencies } from './parse_dependencies';
import Path from 'path';
import { isLeafNode } from '../zoom/zoom_out';
import { fillNodeStats } from '../stats/fill_node_stats';

it('parseDependencies simple', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/simple/tsconfig.json'),
    refresh: true,
  });

  fillNodeStats(root, edges);

  expect(isLeafNode(root)).toBe(false);

  expect(edges['_one_index_ts']).toBeDefined();
  expect(edges['_one_index_ts'].destinations.length).toBe(1);

  // Five functions are imported, and then each are used. Each is considered a connection.
  expect(edges['_one_index_ts'].destinations[0].dependencyWeight).toBe(10);
  expect(edges['_one_index_ts'].destinations[0].destinationNode.intraDependencyCount).toBe(10);
  expect(edges['_one_index_ts'].destinations[0].destinationNode.efferentCoupling).toBe(0);
  expect(edges['_one_index_ts'].destinations[0].destinationNode.afferentCoupling).toBe(10);
  expect(edges['_one_index_ts'].source.intraDependencyCount).toBe(10);
  expect(edges['_one_index_ts'].source.efferentCoupling).toBe(10);
  expect(edges['_one_index_ts'].source.afferentCoupling).toBe(0);
});

it('parseDependencies well organized', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/well_organized/tsconfig.json'),
    refresh: true,
  });

  fillNodeStats(root, edges);

  const oneOneEdge = edges['_one_one_ts'];
  const oneOneSource = edges['_one_one_ts'].source;

  expect(oneOneEdge).toBeDefined();
  expect(oneOneEdge.destinations.length).toBe(3);
  expect(oneOneSource.intraDependencyCount).toBe(2);
  expect(oneOneSource.interDependencyCount).toBe(4);
  expect(oneOneSource.afferentCoupling).toBe(0);
  expect(oneOneSource.efferentCoupling).toBe(2);

  expect(isLeafNode(oneOneSource)).toBeTruthy();

  if (isLeafNode(oneOneSource)) {
    expect(oneOneSource.maxSingleCoupleWeight).toBe(2);
    expect(oneOneSource.orgScore).toBe(2);
  }

  expect(edges['_two_one_ts'].destinations.length).toBe(3);
  expect(edges['_two_one_ts'].source.intraDependencyCount).toBe(4);
  expect(edges['_two_one_ts'].source.interDependencyCount).toBe(4);
  expect(edges['_two_one_ts'].source.afferentCoupling).toBe(2);
  expect(edges['_two_one_ts'].source.efferentCoupling).toBe(2);

  expect(isLeafNode(root)).toBe(false);
  if (!isLeafNode(root)) {
    const oneFolder = root.children.find((c) => c.id === '_one');
    expect(oneFolder).toBeDefined();
  }
});

it('parseDependencies poor organized', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/well_organized/tsconfig.json'),
    refresh: true,
  });

  const oneOneEdge = edges['_one_one_ts'];
  const oneOneSource = edges['_one_one_ts'].source;

  expect(oneOneEdge).toBeDefined();
  expect(oneOneEdge.destinations.length).toBe(3);
  expect(oneOneSource.intraDependencyCount).toBe(2);
  expect(oneOneSource.interDependencyCount).toBe(4);
  expect(oneOneSource.afferentCoupling).toBe(0);
  expect(oneOneSource.efferentCoupling).toBe(2);

  expect(isLeafNode(oneOneSource)).toBeTruthy();

  if (isLeafNode(oneOneSource)) {
    expect(oneOneSource.maxSingleCoupleWeight).toBe(2);
    expect(oneOneSource.orgScore).toBe(2);
  }

  expect(edges['_two_one_ts'].destinations.length).toBe(3);
  expect(edges['_two_one_ts'].source.intraDependencyCount).toBe(4);
  expect(edges['_two_one_ts'].source.interDependencyCount).toBe(4);
  expect(edges['_two_one_ts'].source.afferentCoupling).toBe(2);
  expect(edges['_two_one_ts'].source.efferentCoupling).toBe(2);

  expect(isLeafNode(root)).toBe(false);
  if (!isLeafNode(root)) {
    const oneFolder = root.children.find((c) => c.id === '_one');
    expect(oneFolder).toBeDefined();
  }
});
