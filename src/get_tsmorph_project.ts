import { Project } from 'ts-morph';
import { RepoConfigSettings } from './config';
import Path from 'path';

export function getTSMorphProject(repoInfo: RepoConfigSettings): Project {
  const project = new Project({ tsConfigFilePath: repoInfo.tsconfig });

  // For some reason tsMorph won't pick up all files if just relyign on the tsconfig. Like, only a couple thousand.
  const extraSourceFileDirs: string[] = repoInfo.extraSourceFileGlobs || [];
  extraSourceFileDirs.forEach((sourceFilePath) => {
    const fullPath = Path.resolve(__dirname, '..', '..', '..', sourceFilePath);
    console.log(`Adding sources files at ${fullPath}`);
    project.addSourceFilesAtPaths(fullPath);
  });
  project.resolveSourceFileDependencies();

  console.log(`Project contains ${project.getSourceFiles().length} files`);
  return project;
}
