import { isLeafNode, zoomOut } from './zoom_out';
import { GVEdgeMapping, ParentNode, LeafNode } from '../types';
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
          "innerDependencyCount": 0,
          "innerNodeConnections": 0,
          "innerNodeCount": 2,
          "interDependencyCount": undefined,
          "intraDependencyCount": 0,
          "label": "root/foo",
          "maxSingleCoupleWeight": 0,
          "orgScore": 0,
          "publicAPICount": 0,
        },
      ],
      "efferentCoupling": 0,
      "filePath": "root",
      "id": "root",
      "interDependencyCount": 0,
      "intraDependencyCount": 0,
      "label": "root",
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
    expect((zoomedOutRoot.children[0] as LeafNode).afferentCoupling).toBe(2);
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

  expect(zoomedOutRoot).toMatchInlineSnapshot(`
    Object {
      "afferentCoupling": 0,
      "children": Array [
        Object {
          "afferentCoupling": 0,
          "children": Array [
            Object {
              "afferentCoupling": 0,
              "children": undefined,
              "complexityScore": 3,
              "efferentCoupling": 0,
              "filePath": "root/foo/bar",
              "id": "root_foo_bar",
              "incomingDependencyCount": 0,
              "innerDependencyCount": 0,
              "innerNodeConnections": 0,
              "innerNodeCount": 3,
              "interDependencyCount": undefined,
              "intraDependencyCount": 0,
              "label": "root/foo/bar",
              "maxSingleCoupleWeight": 3,
              "orgScore": 0,
              "publicAPICount": 0,
            },
            Object {
              "afferentCoupling": 0,
              "children": undefined,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/foo/no_kids",
              "id": "root_foo_no_kids",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": undefined,
              "intraDependencyCount": 0,
              "label": "root/foo/no_kids",
              "maxSingleCoupleWeight": 0,
              "publicAPICount": 0,
            },
          ],
          "efferentCoupling": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "interDependencyCount": 0,
          "intraDependencyCount": 3,
          "label": "root/foo",
        },
        Object {
          "afferentCoupling": 0,
          "complexityScore": 0,
          "efferentCoupling": 0,
          "filePath": "root/daa.ts",
          "id": "root_daa_ts",
          "incomingDependencyCount": 0,
          "innerNodeCount": 0,
          "interDependencyCount": undefined,
          "intraDependencyCount": 3,
          "label": "root/daa.ts",
          "maxSingleCoupleWeight": 3,
          "publicAPICount": 0,
        },
      ],
      "efferentCoupling": 0,
      "filePath": "root",
      "id": "root",
      "interDependencyCount": 3,
      "intraDependencyCount": 0,
      "label": "root",
    }
  `);

  expect(zoomedOutEdges).toMatchInlineSnapshot(`
    Object {
      "root_daa_ts": Object {
        "destinations": Array [
          Object {
            "dependencyWeight": 2,
            "destinationNode": Object {
              "afferentCoupling": 0,
              "children": Array [
                Object {
                  "afferentCoupling": 0,
                  "complexityScore": 0,
                  "efferentCoupling": 0,
                  "filePath": "root/foo/bar/lee.ts",
                  "id": "root_foo_bar_lee_ts",
                  "incomingDependencyCount": 0,
                  "innerNodeCount": 0,
                  "interDependencyCount": 0,
                  "intraDependencyCount": 0,
                  "label": "root/foo/bar/lee.ts",
                  "maxSingleCoupleWeight": 0,
                  "publicAPICount": 0,
                },
                Object {
                  "afferentCoupling": 0,
                  "complexityScore": 0,
                  "efferentCoupling": 0,
                  "filePath": "root/foo/bar/bed.ts",
                  "id": "root_foo_bar_bed_ts",
                  "incomingDependencyCount": 0,
                  "innerNodeCount": 0,
                  "interDependencyCount": 0,
                  "intraDependencyCount": 0,
                  "label": "root/foo/bar/bed.ts",
                  "maxSingleCoupleWeight": 0,
                  "publicAPICount": 0,
                },
                Object {
                  "afferentCoupling": 0,
                  "complexityScore": 0,
                  "efferentCoupling": 0,
                  "filePath": "root/foo/bar/zed.ts",
                  "id": "root_foo_bar_zed_ts",
                  "incomingDependencyCount": 0,
                  "innerNodeCount": 0,
                  "interDependencyCount": 0,
                  "intraDependencyCount": 0,
                  "label": "root/foo/bar/zed.ts",
                  "maxSingleCoupleWeight": 0,
                  "publicAPICount": 0,
                },
              ],
              "efferentCoupling": 0,
              "filePath": "root/foo/bar",
              "id": "root_foo_bar",
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo/bar",
            },
          },
        ],
        "source": Object {
          "afferentCoupling": 0,
          "complexityScore": 0,
          "efferentCoupling": 0,
          "filePath": "root/daa.ts",
          "id": "root_daa_ts",
          "incomingDependencyCount": 0,
          "innerNodeCount": 0,
          "interDependencyCount": undefined,
          "intraDependencyCount": 3,
          "label": "root/daa.ts",
          "maxSingleCoupleWeight": 3,
          "publicAPICount": 0,
        },
      },
      "root_foo_bar": Object {
        "destinations": Array [
          Object {
            "dependencyWeight": 1,
            "destinationNode": Object {
              "afferentCoupling": 0,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/daa.ts",
              "id": "root_daa_ts",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": undefined,
              "intraDependencyCount": 3,
              "label": "root/daa.ts",
              "maxSingleCoupleWeight": 3,
              "publicAPICount": 0,
            },
          },
        ],
        "source": Object {
          "afferentCoupling": 0,
          "children": Array [
            Object {
              "afferentCoupling": 0,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/foo/bar/lee.ts",
              "id": "root_foo_bar_lee_ts",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo/bar/lee.ts",
              "maxSingleCoupleWeight": 0,
              "publicAPICount": 0,
            },
            Object {
              "afferentCoupling": 0,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/foo/bar/bed.ts",
              "id": "root_foo_bar_bed_ts",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo/bar/bed.ts",
              "maxSingleCoupleWeight": 0,
              "publicAPICount": 0,
            },
            Object {
              "afferentCoupling": 0,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/foo/bar/zed.ts",
              "id": "root_foo_bar_zed_ts",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo/bar/zed.ts",
              "maxSingleCoupleWeight": 0,
              "publicAPICount": 0,
            },
          ],
          "efferentCoupling": 0,
          "filePath": "root/foo/bar",
          "id": "root_foo_bar",
          "interDependencyCount": 0,
          "intraDependencyCount": 0,
          "label": "root/foo/bar",
        },
      },
    }
  `);

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
    expect((zoomedOutRoot.children[0] as LeafNode).incomingDependencyCount).toBe(undefined);
  }
});

it('zoomOut with different length children, level 1', () => {
  const { edges, root } = getTestEdgesAndRoot();
  const { zoomedOutRoot, zoomedOutEdges } = zoomOut(root, edges, 1);
  expect(zoomedOutRoot).toMatchInlineSnapshot(`
    Object {
      "afferentCoupling": 0,
      "children": Array [
        Object {
          "afferentCoupling": 0,
          "children": undefined,
          "complexityScore": 4,
          "efferentCoupling": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "incomingDependencyCount": 0,
          "innerDependencyCount": 0,
          "innerNodeConnections": 0,
          "innerNodeCount": 4,
          "interDependencyCount": undefined,
          "intraDependencyCount": 3,
          "label": "root/foo",
          "maxSingleCoupleWeight": 3,
          "orgScore": 0,
          "publicAPICount": 0,
        },
        Object {
          "afferentCoupling": 0,
          "complexityScore": 0,
          "efferentCoupling": 0,
          "filePath": "root/daa.ts",
          "id": "root_daa_ts",
          "incomingDependencyCount": 0,
          "innerNodeCount": 0,
          "interDependencyCount": undefined,
          "intraDependencyCount": 3,
          "label": "root/daa.ts",
          "maxSingleCoupleWeight": 3,
          "publicAPICount": 0,
        },
      ],
      "efferentCoupling": 0,
      "filePath": "root",
      "id": "root",
      "interDependencyCount": 3,
      "intraDependencyCount": 0,
      "label": "root",
    }
  `);

  expect(zoomedOutEdges).toMatchInlineSnapshot(`
    Object {
      "root_daa_ts": Object {
        "destinations": Array [
          Object {
            "dependencyWeight": 2,
            "destinationNode": Object {
              "afferentCoupling": 0,
              "children": Array [
                Object {
                  "afferentCoupling": 0,
                  "children": undefined,
                  "complexityScore": 3,
                  "efferentCoupling": 0,
                  "filePath": "root/foo/bar",
                  "id": "root_foo_bar",
                  "incomingDependencyCount": 0,
                  "innerDependencyCount": 0,
                  "innerNodeConnections": 0,
                  "innerNodeCount": 3,
                  "interDependencyCount": 0,
                  "intraDependencyCount": 0,
                  "label": "root/foo/bar",
                  "maxSingleCoupleWeight": 0,
                  "orgScore": 0,
                  "publicAPICount": 0,
                },
                Object {
                  "afferentCoupling": 0,
                  "children": undefined,
                  "complexityScore": 0,
                  "efferentCoupling": 0,
                  "filePath": "root/foo/no_kids",
                  "id": "root_foo_no_kids",
                  "incomingDependencyCount": 0,
                  "innerNodeCount": 0,
                  "interDependencyCount": 0,
                  "intraDependencyCount": 0,
                  "label": "root/foo/no_kids",
                  "maxSingleCoupleWeight": 0,
                  "publicAPICount": 0,
                },
              ],
              "efferentCoupling": 0,
              "filePath": "root/foo",
              "id": "root_foo",
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo",
            },
          },
        ],
        "source": Object {
          "afferentCoupling": 0,
          "complexityScore": 0,
          "efferentCoupling": 0,
          "filePath": "root/daa.ts",
          "id": "root_daa_ts",
          "incomingDependencyCount": 0,
          "innerNodeCount": 0,
          "interDependencyCount": undefined,
          "intraDependencyCount": 3,
          "label": "root/daa.ts",
          "maxSingleCoupleWeight": 3,
          "publicAPICount": 0,
        },
      },
      "root_foo": Object {
        "destinations": Array [
          Object {
            "dependencyWeight": 1,
            "destinationNode": Object {
              "afferentCoupling": 0,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/daa.ts",
              "id": "root_daa_ts",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": undefined,
              "intraDependencyCount": 3,
              "label": "root/daa.ts",
              "maxSingleCoupleWeight": 3,
              "publicAPICount": 0,
            },
          },
        ],
        "source": Object {
          "afferentCoupling": 0,
          "children": Array [
            Object {
              "afferentCoupling": 0,
              "children": undefined,
              "complexityScore": 3,
              "efferentCoupling": 0,
              "filePath": "root/foo/bar",
              "id": "root_foo_bar",
              "incomingDependencyCount": 0,
              "innerDependencyCount": 0,
              "innerNodeConnections": 0,
              "innerNodeCount": 3,
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo/bar",
              "maxSingleCoupleWeight": 0,
              "orgScore": 0,
              "publicAPICount": 0,
            },
            Object {
              "afferentCoupling": 0,
              "children": undefined,
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "root/foo/no_kids",
              "id": "root_foo_no_kids",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "root/foo/no_kids",
              "maxSingleCoupleWeight": 0,
              "publicAPICount": 0,
            },
          ],
          "efferentCoupling": 0,
          "filePath": "root/foo",
          "id": "root_foo",
          "interDependencyCount": 0,
          "intraDependencyCount": 0,
          "label": "root/foo",
        },
      },
    }
  `);

  expect(isLeafNode(zoomedOutRoot)).toBeFalsy();
  if (!isLeafNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
    zoomedOutRoot.children.forEach((child) => {
      expect(isLeafNode(child)).toBe(true);
    });
    expect((zoomedOutRoot.children[0] as LeafNode).intraDependencyCount).toBe(3);
  }
});
