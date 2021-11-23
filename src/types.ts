export interface GVEdgeMapping {
  [key: string]: GVEdge[];
}

/**
 * Map the destination key to each of it's incoming dependency source nodes, and how many times they
 * there is an edge between them.
 */
export interface CouplingWeightMapping {
  [node: string]: { [connectedNode: string]: number };
}

export interface StatStructs {
  couplingWeights: CouplingWeightMapping;
}

export interface GVEdge {
  dest: string;
  colorWeight?: number;
  weight: number;
}

export interface CodeChunkNode {
  id: string;
  label: string;
  innerDependencyCount: number;
  innerNodeCount: number;
  incomingDependencyCount: number;
  publicAPICount: number;

  /**
   * We need a way to determine when a module should be broken apart because there is too much complexity in a single node.
   */
  complexityScore: number;

  /**
   * Consider a node, A, with the following edges and weights:
   * A -> B, weight: 10
   * A -> C, weight: 10
   * A -> D, weight: 5
   *
   * Then this value should be 10. It can be used to decide
   */
  maxSingleCoupleWeight: number;
}

export interface File {
  path: string;
  name: string;
  exports: CodeChunkNode[];
}

export interface Folder {
  path: string;
  name: string;
  files: {
    [key: string]: File;
  };
  folders: { [key: string]: Folder };
}

export interface ClusteredNode {
  id: string;
  label: string;
  children: LeafNode[] | ParentNode[];
}

export type ParentNode = NodeWithNonLeafChildren | NodeWithLeafChildren;

export type LeafNode = CodeChunkNode;

export interface NodeWithNonLeafChildren {
  id: string;
  label: string;
  children: ParentNode[];
}

export interface NodeWithLeafChildren {
  id: string;
  label: string;
  children: CodeChunkNode[];
}
