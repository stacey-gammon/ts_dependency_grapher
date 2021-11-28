import { isLeafNode, zoomOut } from './zoom_out';
import { GVEdgeMapping, ParentNode } from '../types';
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
      source: getNode('root/foo'),
      destinations: [
        {
          destinationNode: getNode('root/foo/zed'),
          dependencyWeight: 1,
        },
        {
          destinationNode: getNode('root/foo/bar'),
          dependencyWeight: 1,
        },
      ],
    },
  };

  const { zoomedOutRoot, zoomedOutEdges } = zoomOut(cluster, edges, 1);

  expect(zoomedOutRoot).toMatchInlineSnapshot(`
    Object {
      "afferentCoupling": 0,
      "children": Array [
        Object {
          "afferentCoupling": 0,
          "children": undefined,
          "complexityScore": 2,
          "efferentCoupling": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "incomingDependencyCount": 0,
          "innerNodeCount": 2,
          "interDependencyCount": 0,
          "intraDependencyCount": 0,
          "label": "root/foo",
          "maxSingleCoupleWeight": 0,
          "orgScore": 0,
          "publicAPICount": 0,
        },
      ],
      "complexityScore": 0,
      "efferentCoupling": 0,
      "filePath": "root",
      "id": "root",
      "incomingDependencyCount": 0,
      "innerNodeCount": 0,
      "interDependencyCount": 0,
      "intraDependencyCount": 0,
      "label": "root",
      "maxSingleCoupleWeight": 0,
      "orgScore": 0,
      "publicAPICount": 0,
    }
  `);

  expect(zoomedOutEdges).toMatchInlineSnapshot(`
    Object {
      "root_foo": Object {
        "destinations": Array [],
        "source": Object {
          "afferentCoupling": 0,
          "complexityScore": 0,
          "efferentCoupling": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "incomingDependencyCount": 0,
          "innerNodeCount": 0,
          "interDependencyCount": 0,
          "intraDependencyCount": 0,
          "label": "root/foo",
          "maxSingleCoupleWeight": 0,
          "orgScore": 0,
          "publicAPICount": 0,
        },
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
  const edges = {
    [rootDaaNode.id]: {
      source: rootDaaNode,
      destinations: [
        {
          destinationNode: rootFooBarLeeNode,
          dependencyWeight: 1,
        },
        {
          destinationNode: rootFooBarBedNode,
          dependencyWeight: 1,
        },
      ],
    },
    [rootFooBarZedNode.id]: {
      source: rootFooBarZedNode,
      destinations: [
        {
          destinationNode: rootDaaNode,
          dependencyWeight: 1,
        },
      ],
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
  expect(zoomedOutEdges[daaNodeId].destinations.length).toBe(1);
  expect(zoomedOutEdges[daaNodeId].destinations[0].dependencyWeight).toBe(2);
  expect(zoomedOutEdges[daaNodeId].destinations[0].destinationNode.id).toBe(rootFooNodeId);

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
