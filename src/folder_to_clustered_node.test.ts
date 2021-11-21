import { getClusteredNodeForFolder } from "./folder_to_clustered_node"
import { Folder } from "./types";


it('getClusteredNodeForFolder different lengths', () => {
  const root: Folder = 
    {
      name: 'root',
      path: 'root',
      files: { },
      folders: {
        'L1Folder1': {
          name: 'L1Folder1',
          path: 'root/L1Folder1',
          files: {
            'L1Folder1File1': {
              name: 'L1Folder1File1',
              path: 'root/L1Folder1/L1Folder1File1',
              exports: [{
                label: 'node2',
                id: 'node2',
                incomingDependencyCount: 1,
                publicAPICount: 1,
                innerNodeCount: 0
              }]
            }
          },
          folders: {},
        },
        'L1Folder2': {
          name: 'L1Folder2',
          path: 'root/L1Folder2',
          files: {},
          folders: {
            'L2Folder1': {
              name: 'L2Folder1',
              path: 'root/L1Folder2/L2Folder1',
              files: {},
              folders: {
                'L3Folder1': {
                  name: 'L3Folder1',
                  path: 'root/L1Folder2/L2Folder1/L3Folder1',
                  folders: {},
                  files: {
                    'L3Folder1File1': {
                      name: 'L3Folder1File1',
                      path: 'root/L1Folder2/L2Folder1/L3Folder1/L3Folder1File1',
                      exports: [{
                        label: 'node3',
                        id: 'node3',
                        incomingDependencyCount: 1,
                        publicAPICount: 1,
                        innerNodeCount: 0,
                      }]
                  },
                }
              },
            }
          },
        }
      }
    }
  };

  const node = getClusteredNodeForFolder(root);

  expect(node).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "id": "node2",
              "incomingDependencyCount": 1,
              "label": "node2",
              "publicAPICount": 1,
            },
          ],
          "id": "root_L1Folder1_L1Folder1File1",
          "label": "L1Folder1File1",
        },
      ],
      "id": "root_L1Folder1",
      "label": "L1Folder1",
    },
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "children": Array [
                    Object {
                      "id": "node3",
                      "incomingDependencyCount": 1,
                      "label": "node3",
                      "publicAPICount": 1,
                    },
                  ],
                  "id": "root_L1Folder2_L2Folder1_L3Folder1_L3Folder1File1",
                  "label": "L3Folder1File1",
                },
              ],
              "id": "root_L1Folder2_L2Folder1_L3Folder1",
              "label": "L3Folder1",
            },
          ],
          "id": "root_L1Folder2_L2Folder1",
          "label": "L2Folder1",
        },
      ],
      "id": "root_L1Folder2",
      "label": "L1Folder2",
    },
  ],
  "id": "root",
  "label": "root",
}
`);
})