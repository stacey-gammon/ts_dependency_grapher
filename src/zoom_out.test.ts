
import { isGVNode, isGVNodeArray, zoomOut } from "./zoom_out";
import { ClusteredNode, GVEdgeMapping, GVNode, ParentNode } from "./types";

// const { gvEdges, root } = getEdgesAndRoot({ tsconfig: Path.resolve(__dirname, '../test/__fixtures__/tsconfig.json') });
// const cluster:  = getClusteredNodeForFolder(root);

it('zoomOut', () => {
  const cluster: ParentNode = {
    id: 'root',
    label: 'root',
    children: [{
      id: 'root_foo',
      label: 'foo',
      children: [
        {
          id: 'root_foo_bar',
          label: 'bar',
          incomingDependencyCount: 1,
          publicAPICount: 1
        },
        {
          id: 'root_foo_zed',
          label: 'zed',
          incomingDependencyCount: 1,
          publicAPICount: 1
        }
      ]
    }]
  }
  const edges: GVEdgeMapping = {
    'root_foo': [{
      dest: 'root_foo_zed',
      weight: 1
    },
    {
      dest: 'root_foo_bar',
      weight: 1
    }]
  };

  const leafToParentId: { [key: string]: string } = {};
  const parentToLeaf: { [key: string]: string[] } = {};

  const zoomedOut: ClusteredNode = zoomOut(cluster, edges, leafToParentId, parentToLeaf, 0, 1) as ClusteredNode;

  expect(leafToParentId).toMatchInlineSnapshot(`
Object {
  "root_foo_bar": "root_foo",
  "root_foo_zed": "root_foo",
}
`);
  expect(zoomedOut).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "id": "root_foo",
      "incomingDependencyCount": 2,
      "label": "foo",
      "publicAPICount": 2,
    },
  ],
  "id": "root",
  "label": "root",
}
`);

  expect(zoomedOut.children).toBeDefined();
  expect(zoomedOut.children!.length).toBe(1);
  expect((zoomedOut.children![0] as GVNode).incomingDependencyCount).toBe(2);
  expect(leafToParentId['root_foo_zed']).toBe('root_foo');
});

const cluster: ParentNode = {
  id: 'root',
  label: 'root',
  children: [{
    id: 'root_foo',
    label: 'foo',
    children: [{
      id: 'root_foo_bar',
      label: 'root_foo_bar',
      children: [{
        id: 'root_foo_bar_lee',
        label: 'bar',
        incomingDependencyCount: 1,
        publicAPICount: 1
      },
      {
        id: 'root_foo_bar_zed',
        label: 'zed',
        incomingDependencyCount: 1,
        publicAPICount: 1
      }]
    },
    {
      id: 'root_foo_no_kids',
      label: 'no_kids',
      children: [],
    }]
  }, {
    id: 'root_daa',
    label: 'daa',
    children: [],
  }]
}
const edges: GVEdgeMapping = {
  'root_daa': [{
    dest: 'root_foo_bar_lee',
    weight: 1
  },
  {
    dest: 'root_foo_bar_zed',
    weight: 1
  }],
  'root_foo_bar_zed': [{
    dest: 'root_daa',
    weight: 1
  }]
};

it('zoomOut with different length children', () => {
  const leafToParentId: { [key: string]: string } = {};
  const parentToLeaf: { [key: string]: string[] } = {};

  const zoomedOut: ClusteredNode = zoomOut(cluster, edges, leafToParentId, parentToLeaf, 0, 2) as ClusteredNode;

  expect(leafToParentId).toMatchInlineSnapshot(`
Object {
  "root_foo_bar_lee": "root_foo_bar",
  "root_foo_bar_zed": "root_foo_bar",
}
`);
  expect(zoomedOut).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        Object {
          "id": "root_foo_bar",
          "incomingDependencyCount": 2,
          "label": "root_foo_bar",
          "publicAPICount": 2,
        },
      ],
      "id": "root_foo",
      "label": "foo",
    },
    Object {
      "children": Array [],
      "id": "root_daa",
      "label": "daa",
    },
  ],
  "id": "root",
  "label": "root",
}
`);

  expect(zoomedOut.children).toBeDefined();
  expect(zoomedOut.children!.length).toBe(2);
  expect((zoomedOut.children![0] as GVNode).incomingDependencyCount).toBe(undefined);
  expect(leafToParentId['root_foo_bar_zed']).toBe('root_foo_bar');
});

it.only('zoomOut with different length children', () => {
  const leafToParentId: { [key: string]: string } = {};
  const parentToLeaf: { [key: string]: string[] } = {};

  const zoomedOut: ClusteredNode = zoomOut(cluster, edges, leafToParentId, parentToLeaf, 0, 1) as ClusteredNode;
  expect(parentToLeaf).toMatchInlineSnapshot(`
Object {
  "root_foo": Array [
    "root_foo_bar_lee",
    "root_foo_bar_zed",
    "root_foo_no_kids",
  ],
  "root_foo_bar": Array [
    "root_foo_bar_lee",
    "root_foo_bar_zed",
  ],
}
`);
  expect(leafToParentId).toMatchInlineSnapshot(`
Object {
  "root_foo_bar_lee": "root_foo",
  "root_foo_bar_zed": "root_foo",
  "root_foo_no_kids": "root_foo",
}
`);
  expect(zoomedOut).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "id": "root_foo",
      "incomingDependencyCount": 2,
      "label": "foo",
      "publicAPICount": 2,
    },
    Object {
      "id": "root_daa",
      "incomingDependencyCount": 0,
      "label": "daa",
      "publicAPICount": 0,
    },
  ],
  "id": "root",
  "label": "root",
}
`);

  expect(zoomedOut.children).toBeDefined();
  expect(zoomedOut.children!.length).toBe(2);

  zoomedOut.children!.forEach(child => {
    expect(isGVNode(child)).toBe(true);
  });

  expect(isGVNodeArray(zoomedOut.children!)).toBe(true);
  expect((zoomedOut.children![0] as GVNode).incomingDependencyCount).toBe(2);
  expect(leafToParentId['root_foo_bar_zed']).toBe('root_foo');
  expect(leafToParentId['root_foo_bar_lee']).toBe('root_foo');
});