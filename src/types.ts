export interface GVEdgeMapping {
  [key: string]: {
    source: LeafNode | ParentNode;

    // Edges have different weighs associated them based on how many imports are between them.
    destinations: Array<{ destinationNode: LeafNode | ParentNode; dependencyWeight: number }>;
  };
}

export interface ParentNode extends BaseNode {
  children: Array<LeafNode | ParentNode>;
}

export interface LeafNode extends BaseNode {
  innerNodeCount: number;
  publicAPICount: number;

  /**
   * We need a way to determine when a module should be broken apart because there is too much complexity in a single node.
   */
  complexityScore: number;
}

export interface NodeStats {
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

  /**
   * Consider a node, A, with the following edges and weights:
   * A -> B, weight: 10
   * A -> C, weight: 10
   * A -> D, weight: 5
   *
   * Then this value should be 10. It can be used to decide
   */
  maxSingleCoupleWeight: number;

  publicAPICount: number;

  /**
   * We need a way to determine when a module should be broken apart because there is too much complexity in a single node.
   */
  complexityScore: number;
}

export interface BaseNode {
  label: string;
  id: string;
  filePath: string;

  parentNode?: ParentNode;
}
