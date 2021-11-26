export interface GVEdgeMapping {
  [key: string]: {
    source: LeafNode | ParentNode;

    // Edges have different weighs associated them based on how many imports are between them.
    destinations: Array<{ destinationNode: LeafNode | ParentNode; dependencyWeight: number }>;
  };
}

export type Edges = Array<{ source: LeafNode; destination: LeafNode }>;

/**
 * Map the destination key to each of it's incoming dependency source nodes, and how many times they
 * there is an edge between them.
 */
export interface CouplingWeightMapping {
  [node: string]: Array<{ connectionId: string; connectionWeight: number }>;
}

export interface StatStructs {
  couplingWeights: CouplingWeightMapping;
}

export interface ParentNode extends BaseNode {
  children: Array<LeafNode | ParentNode>;
}

// export type ParentNode = NodeWithNonLeafChildren | NodeWithLeafChildren;

export interface LeafNode extends BaseNode, NodeStats {}

export interface NodeStats {
  /*
   * TBD on whether this is different than intraDependencyCount. Perhaps it should count _all_ incoming dependencies, both from
   * nodes outside it's parent, and from those internal?
   */
  incomingDependencyCount: number;

  // An indication of cohesion within this node.
  interDependencyCount: number;

  // afferent + efferent Coupling
  intraDependencyCount: number;

  afferentCoupling: number;

  efferentCoupling: number;
  /**
   * This is interDependencyCount - maxSingleCoupleWeight. It is a rough measure of whether this node fits in it's spot. If
   * it has a tighter connection to another node, than it does with it's own siblings, then it might be an indication is should move
   * there. > 0 is good, < 0 means potential for a better home.
   */
  orgScore: number;
  innerNodeCount: number;
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

export interface NodeWithNonLeafChildren extends BaseNode {
  children: ParentNode[];
}

export interface NodeWithLeafChildren extends BaseNode {
  children: LeafNode[];
}

export interface BaseNode {
  label: string;
  id: string;
  filePath: string;

  // An indication of cohesion within this node.
  interDependencyCount: number;

  // afferent + efferent Coupling
  intraDependencyCount: number;

  afferentCoupling: number;

  efferentCoupling: number;

  orgScore: number;
}
