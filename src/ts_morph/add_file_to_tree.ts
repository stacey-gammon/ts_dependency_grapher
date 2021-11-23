import { getSafeName } from '../graph_vis/utils';
import { File, Folder } from '../types';

export function addFileToTree(filePath: string, root: Folder): File {
  console.log('Adding ' + filePath + ' to root');
  const folderNames = filePath.split(/[\\/]/gi);
  let level: Folder = root;
  let pathAccrued = '';
  for (let i = 0; i < folderNames.length; i++) {
    const name = folderNames[i];
    if (name === '' || name === undefined) continue;
    if (i === folderNames.length - 1) {
      if (!level.files[name]) {
        level.files[name] = {
          path: pathAccrued + '/' + name,
          name,
          exports: [
            {
              id: getSafeName(pathAccrued + '/' + name + '_NoName'),
              label: 'index',
              incomingDependencyCount: 0,
              publicAPICount: 0,
              innerNodeCount: 0,
              innerDependencyCount: 0,
              maxSingleCoupleWeight: 0,
              complexityScore: 0,
            },
          ],
        };
      }
      return level.files[name];
    } else {
      if (!level.folders[name]) {
        level.folders[name] = {
          path: pathAccrued + '/' + name,
          name,
          files: {},
          folders: {},
        };
      }
      pathAccrued = pathAccrued + '/' + name;
      level = level.folders[name];
    }
  }

  throw new Error('Reached end and never returned a file.');
}
