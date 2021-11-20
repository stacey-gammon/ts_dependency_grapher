import { addFileToTree, getNodesText } from './dot_utils'
import { getClusteredNodeForFolder } from './folder_to_clustered_node';
import { Folder } from './types';

it('getNodesText', () => {

  const root: Folder = 
    {
      name: 'root',
      path: 'root',
      files: {
        'file1': {
          name: 'file1',
          path: 'root/file1',
          exports: [{
            label: 'node1',
            id: 'node1',
            incomingDependencyCount: 1,
            publicAPICount: 1
          }]
        }
      },
      folders: {
        'subFolder1': {
          name: 'subFolder1',
          path: 'g',
          files: {
            'subFolder1File1': {
              name: 'subFolder1File1',
              path: 'root/subFolder1/subFolder1File1',
              exports: [{
                label: 'node2',
                id: 'node2',
                incomingDependencyCount: 1,
                publicAPICount: 1
              }]
            }
          },
          folders: {},
        }
      }
    };

  const cluster = getClusteredNodeForFolder(root);
  expect(getNodesText(cluster, 0, { maxIncomingDependencyCount: 10, maxPublicApiSize: 10})).toMatchInlineSnapshot(`
"subgraph cluster_root {
        style=filled
        color=\\"#FFBA08\\"  
        label=\\"root\\"
        subgraph cluster_root_file1 {
        style=filled
        color=\\"#F48C06\\"  
        label=\\"file1\\"
        node1 [label=\\"node1\\" fillcolor=\\"#F48C06\\", style=filled fixedsize=true width=1 height=1 fontcolor=\\"#370617\\" fixedsize=true width=1 height=1]

}
subgraph cluster_g {
        style=filled
        color=\\"#F48C06\\"  
        label=\\"subFolder1\\"
        subgraph cluster_g_subFolder1File1 {
        style=filled
        color=\\"#DC2F02\\"  
        label=\\"subFolder1File1\\"
        node2 [label=\\"node2\\" fillcolor=\\"#F48C06\\", style=filled fixedsize=true width=1 height=1 fontcolor=\\"#370617\\" fixedsize=true width=1 height=1]

}
}
}
"
`);
});

it ('addFileToTree duplicate folder name', () => {
  const root: Folder = {
    path: 'root',
    name: 'root',
    files: {},
    folders: {}
  }
  addFileToTree('src/foo/the/foo', root);

  expect(root.folders.src.folders.foo.folders.the.files.foo).toBeDefined();
})

it ('addFileToTree one file', () => {
  const root: Folder = {
    path: 'root',
    name: 'root',
    files: {},
    folders: {}
  }
  addFileToTree('foo.ts', root);

  expect(root.files['foo.ts']).toBeDefined();
})