import { GVEdgeMapping } from "./types";

export  function rollupEdges(edges: GVEdgeMapping, leafToParentId: { [key: string]: string} ): GVEdgeMapping {
  const rolledUpEdges: GVEdgeMapping = {};

  Object.keys(edges).forEach((source) => {
    const leafEdges = edges[source];
    const rolledUpSource = leafToParentId[source] || source;
    
    if (rolledUpEdges[rolledUpSource] === undefined) {
      rolledUpEdges[rolledUpSource] = []
    }
    leafEdges.forEach(leafEdge => {
      const parentDest = leafToParentId[leafEdge.dest] || leafEdge.dest;
      const rolledUpEdge = rolledUpEdges[rolledUpSource].find(e => e.dest === parentDest);
      if (!rolledUpEdge) {
        rolledUpEdges[rolledUpSource].push({
          dest: parentDest,
          weight: leafEdge.weight
        });
      } else {
        rolledUpEdge.weight += leafEdge.weight || 0;
      }
    })
  });
  console.log('rolled up edges', rolledUpEdges);
  return rolledUpEdges;
}