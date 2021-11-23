import { rollupEdges } from './rollup_edges';
import { GVEdgeMapping } from '../types';
import { getNode } from '../node.mock';

it('rollupEdges', () => {
  const edges: GVEdgeMapping = {
    parenta: [
      {
        dest: 'deep_leaf_childb',
        weight: 1,
      },
      {
        dest: 'deep_leaf_childa',
        weight: 1,
      },
    ],
    deep_leaf_childa: [
      {
        dest: 'deep_leaf_childb',
        weight: 1,
      },
      {
        dest: 'parenta',
        weight: 1,
      },
    ],
  };

  const leafToParentId: { [key: string]: string } = {
    deep_leaf_childa: 'parentb',
    deep_leaf_childb: 'parentb',
  };

  const rolledUpEdges = rollupEdges(edges, leafToParentId, getNode());

  expect(rolledUpEdges).toMatchInlineSnapshot(`
Object {
  "parenta": Array [
    Object {
      "dest": "parentb",
      "weight": 2,
    },
  ],
  "parentb": Array [
    Object {
      "dest": "parentb",
      "weight": 1,
    },
    Object {
      "dest": "parenta",
      "weight": 1,
    },
  ],
}
`);
  expect(Object.keys(rolledUpEdges).includes('deep_leaf_childa')).toBe(false);
  expect(rolledUpEdges['parenta'].length).toBe(1);
  expect(rolledUpEdges['parenta'][0].weight).toBe(2);
});
