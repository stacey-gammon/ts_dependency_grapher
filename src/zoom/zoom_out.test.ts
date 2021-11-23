import { isGVNode, isGVNodeArray, zoomOut } from './zoom_out';
import { GVEdgeMapping, CodeChunkNode, ParentNode } from '../types';
import { getNode } from '../node.mock';

it('zoomOut', () => {
  const cluster: ParentNode = {
    id: 'root',
    label: 'root',
    children: [
      {
        id: 'root_foo',
        label: 'foo',
        children: [
          {
            ...getNode(),
            id: 'root_foo_bar',
            label: 'bar',
          },
          {
            ...getNode(),
            id: 'root_foo_zed',
            label: 'zed',
          },
        ],
      },
    ],
  };
  const edges: GVEdgeMapping = {
    root_foo: [
      {
        dest: 'root_foo_zed',
        weight: 1,
      },
      {
        dest: 'root_foo_bar',
        weight: 1,
      },
    ],
  };

  const { zoomedOutRoot } = zoomOut(cluster, edges, 1);

  expect(zoomedOutRoot).toMatchInlineSnapshot(`
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

  if (isGVNode(zoomedOutRoot)) {
    expect(false).toBeTruthy();
  } else {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(1);
    expect((zoomedOutRoot.children[0] as CodeChunkNode).incomingDependencyCount).toBe(2);
  }
});

const cluster: ParentNode = {
  id: 'root',
  label: 'root',
  children: [
    {
      id: 'root_foo',
      label: 'foo',
      children: [
        {
          id: 'root_foo_bar',
          label: 'root_foo_bar',
          children: [
            {
              ...getNode(),
              id: 'root_foo_bar_lee',
              label: 'bar',
            },
            {
              ...getNode(),
              id: 'root_foo_bar_zed',
              label: 'zed',
            },
          ],
        },
        {
          id: 'root_foo_no_kids',
          label: 'no_kids',
          children: [],
        },
      ],
    },
    {
      id: 'root_daa',
      label: 'daa',
      children: [],
    },
  ],
};
const edges: GVEdgeMapping = {
  root_daa: [
    {
      dest: 'root_foo_bar_lee',
      weight: 1,
    },
    {
      dest: 'root_foo_bar_zed',
      weight: 1,
    },
  ],
  root_foo_bar_zed: [
    {
      dest: 'root_daa',
      weight: 1,
    },
  ],
};

it('zoomOut with different length children', () => {
  const { zoomedOutRoot } = zoomOut(cluster, edges, 2);

  expect(zoomedOutRoot).toMatchInlineSnapshot(`
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

  expect(isGVNode(zoomedOutRoot)).toBe(false);
  if (!isGVNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
    expect((zoomedOutRoot.children[0] as CodeChunkNode).incomingDependencyCount).toBe(undefined);
  }
});

it.only('zoomOut with different length children', () => {
  const { zoomedOutRoot } = zoomOut(cluster, edges, 1);
  expect(zoomedOutRoot).toMatchInlineSnapshot(`
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

  expect(isGVNode(zoomedOutRoot)).toBeFalsy();
  if (!isGVNode(zoomedOutRoot)) {
    expect(zoomedOutRoot.children).toBeDefined();
    expect(zoomedOutRoot.children.length).toBe(2);
    zoomedOutRoot.children.forEach((child) => {
      expect(isGVNode(child)).toBe(true);
    });
    expect(isGVNodeArray(zoomedOutRoot.children)).toBe(true);
    expect((zoomedOutRoot.children[0] as CodeChunkNode).incomingDependencyCount).toBe(2);
  }
});
