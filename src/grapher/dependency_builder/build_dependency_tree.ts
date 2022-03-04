import { OutputImageMapping } from '../../types/image_types';
import { RepoConfig } from '../../config/repo_config';
import { parseDependencies } from './dependency_parsing';
import { Project } from 'ts-morph';
import { runDependencyAlgorithms } from './run_dependency_algorithms';

/**
 *
 * @param fileNamePrefix - A file name prefix to use for the generated image.
 */
export async function graph({
  zoom,
  project,
  fileNamePrefix,
  repoInfo,
  repoImages,
}: {
  zoom?: number;
  project: Project;
  fileNamePrefix: string;
  repoInfo: RepoConfig;
  repoImages: OutputImageMapping;
}) {
  const { edges, root, items } = parseDependencies({
    repoInfo,
    project,
    entries: repoInfo.entries,
  });

  await runDependencyAlgorithms({
    edges,
    root,
    fileNamePrefix,
    zoom,
    items,
    repoInfo,
    repoImages,
  });
}
