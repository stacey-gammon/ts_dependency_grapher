import { addNode } from './add_node';
import { ParentNode } from '../types';
import { getParentNode } from '../node.mock';

it('addNode', () => {
  const root: ParentNode = getParentNode('');
  const addedNode = addNode('/src/foo/bar', root);
  expect(root).toMatchInlineSnapshot(`
    Object {
      "afferentCoupling": 0,
      "children": Array [
        Object {
          "afferentCoupling": 0,
          "children": Array [
            Object {
              "afferentCoupling": 0,
              "children": Array [
                Object {
                  "afferentCoupling": 0,
                  "complexityScore": 0,
                  "efferentCoupling": 0,
                  "filePath": "/src/foo/bar",
                  "id": "_src_foo_bar",
                  "incomingDependencyCount": 0,
                  "innerNodeCount": 0,
                  "interDependencyCount": 0,
                  "intraDependencyCount": 0,
                  "label": "/src/foo/bar",
                  "maxSingleCoupleWeight": 0,
                  "publicAPICount": 0,
                },
              ],
              "complexityScore": 0,
              "efferentCoupling": 0,
              "filePath": "/src/foo",
              "id": "_src_foo",
              "incomingDependencyCount": 0,
              "innerNodeCount": 0,
              "interDependencyCount": 0,
              "intraDependencyCount": 0,
              "label": "/src/foo",
              "maxSingleCoupleWeight": 0,
              "publicAPICount": 0,
            },
          ],
          "complexityScore": 0,
          "efferentCoupling": 0,
          "filePath": "/src",
          "id": "_src",
          "incomingDependencyCount": 0,
          "innerNodeCount": 0,
          "interDependencyCount": 0,
          "intraDependencyCount": 0,
          "label": "/src",
          "maxSingleCoupleWeight": 0,
          "publicAPICount": 0,
        },
      ],
      "efferentCoupling": 0,
      "filePath": "",
      "id": "",
      "interDependencyCount": 0,
      "intraDependencyCount": 0,
      "label": "",
    }
  `);

  expect(addedNode?.filePath).toBe('/src/foo/bar');
});
