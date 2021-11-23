import { Folder } from '../types';
import { addFileToTree } from './add_file_to_tree';

it('addFileToTree duplicate folder name', () => {
  const root: Folder = {
    path: 'root',
    name: 'root',
    files: {},
    folders: {},
  };
  addFileToTree('src/foo/the/foo', root);

  expect(root.folders.src.folders.foo.folders.the.files.foo).toBeDefined();
});

it('addFileToTree one file', () => {
  const root: Folder = {
    path: 'root',
    name: 'root',
    files: {},
    folders: {},
  };
  addFileToTree('foo.ts', root);

  expect(root.files['foo.ts']).toBeDefined();
});
