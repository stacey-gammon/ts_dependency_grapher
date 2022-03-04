// import { rollupEdges } from './rollup_edges';
// import { GVEdgeMapping, ParentNode } from '../types';
// import { getNode, getParentNode } from '../node.mock';
// import { zoomOut } from './zoom_out';

// it('rollupEdges', () => {
//   const leafANode = getNode('root/foo/a.ts');
//   const leafBNode = getNode('root/foo/b.ts');
//   const zooParentNode = getParentNode('root/zoo.ts');
//   const fooParentNode = getParentNode('root/foo');

//   const edges: GVEdgeMapping = {
//     [zooParentNode.id]: {
//       source: zooParentNode,
//       destinations: [
//         {
//           destinationNode: leafANode,
//           dependencyWeight: 1,
//         },
//         {
//           destinationNode: leafBNode,
//           dependencyWeight: 1,
//         },
//       ],
//     },
//     [leafANode.id]: {
//       source: leafANode,
//       destinations: [
//         {
//           destinationNode: leafBNode,
//           dependencyWeight: 1,
//         },
//         {
//           destinationNode: zooParentNode,
//           dependencyWeight: 1,
//         },
//       ],
//     },
//   };

//   const leafToParentId: { [key: string]: ParentNode } = {};

//   const rootNode: ParentNode = {
//     ...getParentNode('root'),
//     children: [
//       {
//         ...getParentNode('root/foo'),
//         children: [getNode('root/foo/a.ts'), getNode('root/foo/b.ts')],
//       },
//       getNode('root/zoo.ts'),
//     ],
//   };

//   const zoomedOut = zoomOut(rootNode, edges, 2);

//   const rolledUpEdges = rollupEdges(edges, leafToParentId, zoomedOut);

//   expect(rolledUpEdges).toMatchInlineSnapshot(`
//     Object {
//       "root_foo": Object {
//         "destinations": Array [
//           Object {
//             "dependencyWeight": 1,
//             "destinationNode": "root_zoo",
//           },
//         ],
//         "source": Object {
//           "afferentCoupling": 0,
//           "children": Array [],
//           "efferentCoupling": 0,
//           "filePath": "root/foo",
//           "id": "root_foo",
//           "interDependencyCount": 0,
//           "intraDependencyCount": 0,
//           "label": "root/foo",
//         },
//       },
//       "undefined": Object {
//         "destinations": Array [
//           Object {
//             "dependencyWeight": 2,
//             "destinationNode": Object {
//               "afferentCoupling": 0,
//               "children": Array [],
//               "efferentCoupling": 0,
//               "filePath": "root/foo",
//               "id": "root_foo",
//               "interDependencyCount": 0,
//               "intraDependencyCount": 0,
//               "label": "root/foo",
//             },
//           },
//         ],
//         "source": "root_zoo",
//       },
//     }
//   `);
//   expect(rolledUpEdges[leafANode.id]).toBeUndefined();
//   expect(rolledUpEdges[zooParentNode.id].destinations.length).toBe(1);
//   expect(rolledUpEdges[zooParentNode.id].destinations[0].dependencyWeight).toBe(2);
//   expect(rolledUpEdges[zooParentNode.id].destinations[0].dependencyWeight).toBe(2);
// });
