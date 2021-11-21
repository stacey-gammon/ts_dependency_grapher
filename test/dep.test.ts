/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getDotFileText, getEdgesAndRoot } from '../src/build_dot'
import Path from 'path';
import fs from 'fs';
import { zoomOut } from '../src/zoom_out';
import { getClusteredNodeForFolder } from '../src/folder_to_clustered_node';
import { rollupEdges } from '../src/rollup_edges';
import { getDepth } from '../src/utils';


it('suite', () => {
  const { gvEdges, root } = getEdgesAndRoot({ repo: 'test', tsconfig: Path.resolve(__dirname, './__fixtures__/tsconfig.json') });
  const leafToParentId: { [key: string]: string } = {};
  const parentIdToLeaf: { [key: string]: string[] } = {};

  const rootNode = getClusteredNodeForFolder(root);
  console.log('Root node children')
  console.log(JSON.stringify(rootNode.children, null, 2));
  const cluster = zoomOut(rootNode, gvEdges, leafToParentId, parentIdToLeaf, 0, 2);

  expect(getDepth(cluster as any)).toBe(2);
  const rolledUpEdges = rollupEdges(gvEdges, leafToParentId);

  console.log(leafToParentId)
  console.log(rolledUpEdges)
  expect(Object.keys(rolledUpEdges).find(source => source.indexOf("bar_zed_lag") >= 0 ? true : undefined)).toBe(undefined);
  expect(root.folders.bar).toBeDefined();
});

it('create test png', () => {
  const text = getDotFileText({ repo: 'test', tsconfig: Path.resolve(__dirname, './__fixtures__/tsconfig.json'), zoom: 2, maxImageSize: 5 });
  expect(text).toBeDefined();
  expect(text?.indexOf("bar_zed_lag")).toBeLessThan(0);
  fs.writeFileSync(Path.resolve(__dirname, 'test.dot'), text!);
});