import { ClassDeclaration, InterfaceDeclaration, SourceFile } from 'ts-morph';

export function getComplexityScoreOfFile(file: SourceFile): number {
  return (
    getComplexityScoreOfClasses(file.getClasses()) +
    file.getFunctions().length +
    getComplexityScoreOfClasses(file.getInterfaces()) +
    file.getExportedDeclarations().size +
    file.getTypeAliases().length
  );
}

function getComplexityScoreOfClasses(node: Array<ClassDeclaration | InterfaceDeclaration>) {
  return (
    1 + node.reduce((sum, cls) => sum + cls.getMembers().length + cls.getProperties().length, 0)
  );
}
