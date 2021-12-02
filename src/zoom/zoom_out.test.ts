import { isLeafNode, zoomOut } from './zoom_out';
import { ParentNode } from '../types/types';
import { GVEdgeMapping } from '../types/edge_types';
import { getNode, getParentNode } from '../node.mock';

it.only('zoomOut', () => {
  const cluster: ParentNode = {
    ...getParentNode('root'),
    children: [
      {
        ...getParentNode('root/foo'),
        children: [getNode('root/foo/bar'), getNode('root/foo/zed')],
      },
    ],
  };
  const edges: GVEdgeMapping = {
    root_foo: {
      node: getNode('root/foo'),
      outgoing: [
        {
          node: getNode('root/foo/zed'),
          dependencyWeight: 1,
        },
        {
          node: getNode('root/foo/bar'),
          dependencyWeight: 1,
        },
      ],
      incoming: [],
    },
  };

  const { zoomedOutRoot, zoomedOutEdges } = zoomOut(cluster, edges, 1);

  expect(zoomedOutRoot).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": undefined,
          "complexityScore": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "innerNodeCount": 0,
          "label": "root/foo",
          "parentNode": undefined,
          "publicAPICount": 0,
        },
      ],
      "complexityScore": 0,
      "filePath": "root",
      "id": "root",
      "innerNodeCount": 0,
      "label": "root",
      "parentNode": undefined,
      "publicAPICount": 0,
    }
  `);

  expect(zoomedOutEdges).toMatchInlineSnapshot(`
    Object {
      "root_foo": Object {
        "incoming": Array [],
        "node": Object {
          "complexityScore": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "innerNodeCount": 0,
          "label": "root/foo",
          "parentNode": undefined,
          "publicAPICount": 0,
        },
        "outgoing": Array [],
      },
    }
  `);

  if (isLeafNode(zoomedOutRoot)) {
    expect(false).toBeTruthy();
  } else {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(1);
  }
});

function getTestEdgesAndRoot(): { edges: GVEdgeMapping; root: ParentNode } {
  const rootDaaNode = getNode('root/daa.ts');
  const rootFooBarLeeNode = getNode('root/foo/bar/lee.ts');
  const rootFooBarBedNode = getNode('root/foo/bar/bed.ts');
  const rootFooBarZedNode = getNode('root/foo/bar/zed.ts');
  const rootFooParent = {
    ...getParentNode('root/foo'),
    children: [
      {
        ...getParentNode('root/foo/bar'),
        children: [rootFooBarLeeNode, rootFooBarBedNode, rootFooBarZedNode],
      },
      getParentNode('root/foo/no_kids'),
    ],
  };

  const root: ParentNode = {
    ...getParentNode('root'),
    children: [rootFooParent, rootDaaNode],
  };
  const edges: GVEdgeMapping = {
    [rootDaaNode.id]: {
      node: rootDaaNode,
      outgoing: [
        {
          node: rootFooBarLeeNode,
          dependencyWeight: 1,
        },
        {
          node: rootFooBarBedNode,
          dependencyWeight: 1,
        },
      ],
      incoming: [],
    },
    [rootFooBarZedNode.id]: {
      node: rootFooBarZedNode,
      outgoing: [
        {
          node: rootDaaNode,
          dependencyWeight: 1,
        },
      ],
      incoming: [],
    },
  };
  return { edges, root };
}

it('zoomOut with different length children, level 2', () => {
  const { edges, root } = getTestEdgesAndRoot();
  const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, edges, 2);

  const daaNodeId = getNode('root/daa.ts').id;
  const rootFooNodeId = getParentNode('root/foo').id;
  expect(zoomedOutEdges[daaNodeId]).toBeDefined();
  expect(zoomedOutEdges[daaNodeId].outgoing.length).toBe(1);
  expect(zoomedOutEdges[daaNodeId].outgoing[0].dependencyWeight).toBe(2);
  expect(zoomedOutEdges[daaNodeId].outgoing[0].node.id).toBe(rootFooNodeId);

  expect(isLeafNode(zoomedOutRoot)).toBe(false);
  if (!isLeafNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
  }
});

it('zoomOut with different length children, level 1', () => {
  const { edges, root } = getTestEdgesAndRoot();
  const { zoomedOutRoot } = zoomOut(root, edges, 1);

  expect(isLeafNode(zoomedOutRoot)).toBeFalsy();
  if (!isLeafNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
    zoomedOutRoot.children.forEach((child) => {
      expect(isLeafNode(child)).toBe(true);
    });
  }
});
