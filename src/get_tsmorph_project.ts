import { Project } from 'ts-morph';
import { RepoInfo } from './config/repo_config_settings';
import { convertConfigRelativePathToAbsolutePath } from './utils';

export function getTSMorphProject(repoInfo: RepoInfo): Project {
  const project = new Project({ tsConfigFilePath: repoInfo.tsconfig });

  // For some reason tsMorph won't pick up all files if just relyign on the tsconfig. Like, only a couple thousand.
  const extraSourceFileDirs: string[] = repoInfo.extraSourceFileGlobs || [];
  extraSourceFileDirs.forEach((sourceFilePath) => {
    const fullPath = convertConfigRelativePathToAbsolutePath(sourceFilePath);
    console.log(`Adding sources files at ${fullPath}`);
    const addedFiles = project.addSourceFilesAtPaths(fullPath);
    if (addedFiles.length === 0) {
      console.warn(`No files matching ${fullPath}`);
    }
  });
  project.resolveSourceFileDependencies();

  console.log(`Project contains ${project.getSourceFiles().length} files`);
  return project;
}
