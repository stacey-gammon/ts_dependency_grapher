import { Node, Project, SourceFile } from 'ts-morph'
import { addEdges, addGVNode, isNamedNode } from './tsmorph_utils';
import { GVEdge, GVNode } from './types';
import Path from 'path';

export let repoRoot: string;

export function getDotFileText({ entry , tsconfig}: { entry: string; tsconfig: string }): string | undefined{
  const project = new Project({ tsConfigFilePath: tsconfig });
  project.resolveSourceFileDependencies();

  const file = project.getSourceFileOrThrow(entry);

  repoRoot = Path.resolve(tsconfig, '..');

  if (file) {
    const { nodes, edges } = getNodesAndEdges(file);
    return getDiGraphText(edges, nodes);
  } else {
    console.error(`No file found: ${entry}`);
    return undefined;
  }
}

function getDiGraphText(dependencies: Array<GVEdge>, nodes: GVNode[]) {
  return `digraph test{
    ${getNodesText(nodes)}
     ${getDependenciesText(dependencies)}
  }`;
}

function getNodesText(nodes: GVNode[]): string {
  let text = '';
  nodes.forEach(({ label }) => {
    text += `${getSafeName(label)}\n`;
  });
  return text;
}
  

function getDependenciesText(
  dependencies: Array<{ source: string; dest: string; properties?: string }>
) {
  let text = '';
  dependencies.forEach(({ source, dest, properties }) => {
    text += `${getSafeName(source)} -> ${getSafeName(dest)} ${
      properties ? `[${properties}]` : ''
    }\n`;
  });
  return text;
}
  
export function getSafeName(name: string): string {
  return name === 'graph' ? 'graph1' : name.replace(/[ /\-.@]/gi, '');
}

/**
 *
 * @param source the file we want to extract exported declaration nodes from.
 * @param log
 */
function getNodesAndEdges(source: SourceFile): { edges: GVEdge[], nodes: GVNode[] } {
  const nodes: Node[] = [];
  const exported = source.getExportedDeclarations();
  const gvEdges: GVEdge[] = [];
  const gvNodes: GVNode[] = [];
  
  // Filter out the exported declarations that exist only for the plugin system itself.
  exported.forEach((val) => {
    val.forEach((ed) => {
      const name: string = isNamedNode(ed) ? ed.getName() : '';
      if (name && name !== '') {
        addEdges(ed, gvEdges);
        addGVNode(ed, gvNodes);
      } else {
        console.log('API with missing name encountered, text is ' + ed.getText().substring(0, 50));
      }
    });
  });
  
  console.log(`Collected ${nodes.length} exports from file ${source.getFilePath()}`);
  return { edges: gvEdges, nodes: gvNodes }
}

