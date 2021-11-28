/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getNode, getParentNode } from '../node.mock';
import { GVEdgeMapping } from '../types';
import { getCouplingWeightMapping } from './get_coupling_weight_mapping';

it('getCouplingWeightMapping', () => {
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
      source: aNode,
      destinations: [
        {
          destinationNode: intraDest1,
          dependencyWeight: 2,
        },
        {
          destinationNode: intraDest2,
          dependencyWeight: 3,
        },
        {
          destinationNode: interDest1,
          dependencyWeight: 1,
        },
      ],
    },
  };

  const weights = {};
  const mapping = getCouplingWeightMapping(edges, weights);

  console.log(mapping);

  // Only tracks intra connections.
  expect(mapping[aNode.id].length).toBe(1);
  const intraConn = mapping[aNode.id].find(
    (conn) => conn.parentNode.id === intraDest1.parentNode!.id
  );
  expect(intraConn?.connectionWeight).toBe(5);
});
