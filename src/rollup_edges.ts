import { GVEdgeMapping } from "./types";

export  function rollupEdges(leafSourceEdges: GVEdgeMapping, leafToParentId: { [key: string]: string} ):
    { rolledUpEdges: GVEdgeMapping, innerDependencyCount: { [key: string]: number } } {
  const rolledUpEdges: GVEdgeMapping = {};
  const innerDependencyCount: { [key: string]: number } = {};

  Object.keys(leafSourceEdges).forEach((leafSource) => {
    const leafDestEdges = leafSourceEdges[leafSource];
    const rolledUpSource = leafToParentId[leafSource] || leafSource;

    if (rolledUpEdges[rolledUpSource] === undefined) {
      rolledUpEdges[rolledUpSource] = []
    }
    leafDestEdges.forEach(leafDestEdge => {
      if (leafToParentId[leafDestEdge.dest] === leafToParentId[leafSource] && leafToParentId[leafSource] !== undefined) {
        if (!innerDependencyCount[rolledUpSource]) innerDependencyCount[rolledUpSource] = 0;
        innerDependencyCount[rolledUpSource]++; 
      }

      const parentDest = leafToParentId[leafDestEdge.dest] || leafDestEdge.dest;
      const rolledUpEdge = rolledUpEdges[rolledUpSource].find(e => e.dest === parentDest);
      if (!rolledUpEdge && rolledUpSource != parentDest) {
        rolledUpEdges[rolledUpSource].push({
          dest: parentDest,
          weight: leafDestEdge.weight
        });
      } else if (rolledUpEdge) {
        rolledUpEdge.weight += leafDestEdge.weight || 0;
      }
    })
  });
  return { rolledUpEdges, innerDependencyCount };
}