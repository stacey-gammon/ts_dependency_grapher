import { parseDependencies } from './parse_dependencies';
import Path from 'path';
import { isLeafNode } from '../zoom/zoom_out';
import {
  removeCircularDependencies,
  removeCircularDependenciesFromEdges,
} from '../remove_node_circular_deps';

it('parseDependencies simple', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/simple/tsconfig.json'),
    refresh: true,
  });

  expect(isLeafNode(root)).toBe(false);

  expect(edges['_one_index_ts']).toBeDefined();
  expect(edges['_one_index_ts'].destinations.length).toBe(1);
  // Five functions are imported, and then each are used. Each is considered a connection.
  expect(edges['_one_index_ts'].destinations[0].dependencyWeight).toBe(10);
});

it.only('parseDependencies well organized', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/well_organized/tsconfig.json'),
    refresh: true,
  });

  expect(Object.keys(edges).length).toBe(3);

  const a3Edge = edges['_A_3_ts'];
  const a3Source = edges['_A_3_ts'].source;

  expect(a3Edge).toBeDefined();
  expect(a3Edge.destinations.length).toBe(3);

  expect(isLeafNode(a3Source)).toBeTruthy();

  expect(edges['_B_6_ts'].destinations.length).toBe(3);

  expect(isLeafNode(root)).toBe(false);
  if (!isLeafNode(root)) {
    const aFolder = root.children.find((c) => c.id === '_A');
    expect(aFolder).toBeDefined();
  }
});

it('parseDependencies poor organized', () => {
  const { edges, root } = parseDependencies({
    repo: 'test',
    tsconfig: Path.resolve(__dirname, '../../examples/well_organized/tsconfig.json'),
    refresh: true,
  });

  expect(Object.keys(edges).length).toBe(3);

  const aThreeEdge = edges['_A_3_ts'];
  expect(aThreeEdge).toBeDefined();

  const a3Source = edges['_A_3_ts'].source;
  expect(isLeafNode(a3Source)).toBeTruthy();
  expect(aThreeEdge.destinations.length).toBe(3);
  expect(edges['_B_6_ts'].destinations.length).toBe(3);
  expect(isLeafNode(root)).toBe(false);
  if (!isLeafNode(root)) {
    const oneFolder = root.children.find((c) => c.id === '_A');
    expect(oneFolder).toBeDefined();
  }
});
