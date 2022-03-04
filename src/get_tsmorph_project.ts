import { Project } from 'ts-morph';

export function getTSMorphProject(
  tsconfig: string,
  extraSourceFileDirs: Array<string> = []
): Project {
  const project = new Project({ tsConfigFilePath: tsconfig });

  // Sometimes tsmorph won't pick up on all the files relying on the tsconfig alone.
  extraSourceFileDirs.forEach((sourceFilePath) => {
    console.log(`Adding sources files at ${sourceFilePath}`);
    const addedFiles = project.addSourceFilesAtPaths(sourceFilePath);
    if (addedFiles.length === 0) {
      console.warn(`No files matching ${sourceFilePath}`);
    }
  });
  project.resolveSourceFileDependencies();

  console.log(`Project contains ${project.getSourceFiles().length} files`);
  return project;
}
