import { getOrCreateNode } from './add_node';
import { getParentNode } from '../../../test/node.mock';
import { ApiItemMap, ParentNode } from '../types';

it('addNode', () => {
  const items: ApiItemMap = {};
  const root: ParentNode = getParentNode('', items);
  const addedNode = getOrCreateNode('/src/foo/bar', root, 0, items);
  expect(root).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "complexityScore": 0,
                  "filePath": "/src/foo/bar",
                  "id": "_src_foo_bar",
                  "innerNodeCount": 0,
                  "label": "/src/foo/bar",
                  "parentNode": [Circular],
                  "publicAPICount": 0,
                },
              ],
              "complexityScore": 0,
              "filePath": "/src/foo",
              "id": "_src_foo",
              "innerNodeCount": 0,
              "label": "/src/foo",
              "parentNode": [Circular],
              "publicAPICount": 0,
            },
          ],
          "complexityScore": 0,
          "filePath": "/src",
          "id": "_src",
          "innerNodeCount": 0,
          "label": "/src",
          "parentNode": [Circular],
          "publicAPICount": 0,
        },
      ],
      "complexityScore": 0,
      "filePath": "",
      "id": "",
      "innerNodeCount": 0,
      "label": "",
      "parentNode": undefined,
      "publicAPICount": 0,
    }
  `);

  expect(addedNode).toBeDefined();
  if (addedNode) {
    expect(items[addedNode.id]?.filePath).toBe('/src/foo/bar');
  }
});
