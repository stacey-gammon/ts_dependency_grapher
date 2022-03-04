export interface ParentNode {
  id: string;
  children: Array<LeafNode | ParentNode>;
  parentId?: string;
}

export interface LeafNode {
  id: string;
  parentId?: string;
}

export interface ApiItem {
  innerNodeCount: number;
  publicAPICount: number;

  /**
   * We need a way to determine when a module should be broken apart because there is too much complexity in a single node.
   */
  complexityScore: number;

  label: string;
  id: string;
  filePath: string;
}

export type ApiItemMap = Record<string, ApiItem>;
