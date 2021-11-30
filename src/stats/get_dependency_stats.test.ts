/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getNode, getParentNode } from '../node.mock';
import { GVEdgeMapping } from '../types';
import { getDependencyStats } from './get_dependency_stats';

it('getDependencyStats', () => {
  const aParent = getParentNode('A');
  const bParent = getParentNode('B');
  const aNode = getNode('A/1.ts', aParent);
  aParent.children.push(aNode);
  const interDest1 = getNode('A/2.ts', aParent);
  aParent.children.push(interDest1);
  const intraDest1 = getNode('B/1.ts', bParent);
  bParent.children.push(intraDest1);
  const intraDest2 = getNode('B/1.ts', bParent);
  bParent.children.push(intraDest2);

  const edges: GVEdgeMapping = {
    [aNode.id]: {
      node: aNode,
      outgoing: [
        {
          node: intraDest1,
          dependencyWeight: 2,
        },
        {
          node: intraDest2,
          dependencyWeight: 3,
        },
        {
          node: interDest1,
          dependencyWeight: 1,
        },
      ],
      incoming: [],
    },
  };

  const weights = {};
  const mapping = getDependencyStats(edges, weights);

  console.log(mapping);

  // Only tracks intra connections.
  expect(mapping[aNode.id].length).toBe(1);
  const intraConn = mapping[aNode.id].find(
    (conn) => conn.parentNode.id === intraDest1.parentNode!.id
  );
  expect(intraConn?.connectionWeight).toBe(5);
});
