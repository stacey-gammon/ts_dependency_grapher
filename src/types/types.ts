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

export interface BaseNode {
  label: string;
  id: string;
  filePath: string;

  parentNode?: ParentNode;
}
