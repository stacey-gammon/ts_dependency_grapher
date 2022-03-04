import { isLeafNode, isParentNode } from '../utils';
import { zoomOut } from './zoom_out';
import { ParentNode, GVEdgeMapping } from '../types';
import { getLeafNode, getParentNode } from '../../../test/node.mock';
import { addEdge } from '../dependency_parsing/add_edge';
import { ApiItemMap } from '../types/node_types';

it('zoomOut', () => {
  const items: ApiItemMap = {};
  const root = getParentNode('root', items);
  const root_a = getParentNode('root/a', items, root);
  const root_a_1 = getLeafNode('root/a/1', items, root_a);
  const root_a_2 = getLeafNode('root/a/2', items, root_a);
  const root_b = getParentNode('root/b', items, root);
  const root_b_1 = getParentNode('root/b/1', items, root_b);
  const root_b_1_a = getLeafNode('root/b/1/a', items, root_b_1);

  root.children = [root_a, root_b];
  root_a.children = [root_a_1, root_a_2];
  root_a.children = [root_a_1, root_a_2];
  root_b.children = [root_b_1];
  root_b_1.children = [root_b_1_a];

  const edges: GVEdgeMapping = {};
  addEdge(edges, root_a_1, root_a_2);
  addEdge(edges, root_b_1_a, root_a_1);

  const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, items, edges, 1);

  expect(isLeafNode(zoomedOutRoot)).toBeFalsy();
  if (isParentNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
    const rolledUpChild = zoomedOutRoot.children[0];
    expect(isLeafNode(rolledUpChild)).toBeTruthy();
  }

  expect(zoomedOutEdges[root_a.id]).toBeDefined();
  expect(zoomedOutEdges[root_a.id].incoming.length).toBe(1);
  expect(zoomedOutEdges[root_a.id].incoming[0].node.id).toBe('root_b');
  expect(zoomedOutEdges[root_a.id].outgoing.length).toBe(0);
});

function getTestEdgesAndRoot(): { edges: GVEdgeMapping; root: ParentNode; items: ApiItemMap } {
  const items: ApiItemMap = {};
  const root = getParentNode('root/a', items);
  const root_a = getParentNode('root/a', items, root);
  const root_b = getLeafNode('root/b.ts', items, root);
  const root_a_1 = getParentNode('root/a/1', items, root_a);
  const root_a_1_a = getLeafNode('root/a/1/a.ts', items, root_a_1);
  const root_a_1_b = getLeafNode('root/a/1/b.ts', items, root_a_1);
  const root_a_1_c = getLeafNode('root/a/1/c.ts', items, root_a_1);

  root.children = [root_a, root_b];
  root_a.children = [root_a_1];
  root_a_1.children = [root_a_1_a, root_a_1_b, root_a_1_c];

  const edges: GVEdgeMapping = {};

  addEdge(edges, root_a_1_c, root_a_1_b);
  addEdge(edges, root_a_1_c, root_b);
  addEdge(edges, root_a_1_b, root_b);

  return { edges, root, items };
}

it('zoomOut with different length children, level 2', () => {
  const { edges, root, items } = getTestEdgesAndRoot();

  expect(edges['root_a_1_c_ts']).toBeDefined();

  const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, items, edges, 2);

  expect(zoomedOutEdges['root_a_1_c_ts']).toBeUndefined();
  expect(zoomedOutEdges['root_a_1']).toBeDefined();
  expect(zoomedOutEdges['root_a_1'].outgoing.length).toBe(1);
  expect(zoomedOutEdges['root_a_1'].outgoing[0].dependencyWeight).toBe(2);
  expect(zoomedOutEdges['root_a_1'].outgoing[0].node.id).toBe('root_b_ts');

  expect(isLeafNode(zoomedOutRoot)).toBe(false);
  if (isParentNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
  }
});

it('zoomOut with different length children, level 1', () => {
  const { edges, items, root } = getTestEdgesAndRoot();
  const { zoomedOutRoot } = zoomOut(root, items, edges, 1);

  expect(isLeafNode(zoomedOutRoot)).toBeFalsy();
  if (isParentNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
    zoomedOutRoot.children.forEach((child) => {
      expect(isLeafNode(child)).toBe(true);
    });
  }
});
