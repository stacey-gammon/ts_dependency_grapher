import { getOrCreateNode } from './add_node';
import { ParentNode } from '../../../types/types';
import { getParentNode } from '../../../test/node.mock';

it('addNode', () => {
  const root: ParentNode = getParentNode('');
  const addedNode = getOrCreateNode('/src/foo/bar', root, 0);
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

  expect(addedNode?.filePath).toBe('/src/foo/bar');
});
