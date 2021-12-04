/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { addEdge } from '../dependency_parsing/add_edge';
import { getNode, getParentNode } from '../node.mock';
import { GVEdgeMapping } from '../types/edge_types';
import { DependencyStatsMapping, fillDependencyStats } from './get_dependency_stats';

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

  const edges: GVEdgeMapping = {};

  addEdge(edges, aNode, interDest1);
  addEdge(edges, interDest1, aNode);

  // Adding multiple times will increase dependency weight.
  addEdge(edges, aNode, intraDest2);
  addEdge(edges, aNode, intraDest2);
  addEdge(edges, aNode, intraDest2);
  addEdge(edges, intraDest2, aNode);

  const weights: DependencyStatsMapping = {};
  fillDependencyStats(edges, weights);

  // A -> Inter, Inter -> A
  expect(weights[aNode.id].interDependencyCount).toBe(2);

  expect(weights[aNode.id].intraDependencyCount).toBe(4);
  // Efferent = outgoing intra dependency counts.
  expect(weights[aNode.id].efferentCoupling).toBe(3);
  // Afferent = incoming intra dependency counts.
  expect(weights[aNode.id].afferentCoupling).toBe(1);
});
