import { isGVNode } from "./zoom_out";

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
  innerDependencyCount: { [key: string]: number };
  couplingWeights: CouplingWeightMapping;
}

export interface GVEdge {
    dest: string;
    colorWeight?: number;
    weight: number;
}

export interface GVNode {
    id: string;
    label: string;
    innerNodeCount: number,
    incomingDependencyCount: number;
    publicAPICount: number;
}

export interface File {
  path: string;
  name: string;
  exports: GVNode[];
}

export interface Folder {
   path: string;
   name: string; 
   files: {
       [key:string]: File
   };
   folders: { [key: string]: Folder };
}

export interface ClusteredNode {
    id: string;
    label: string;
    children: LeafNode[] | ParentNode[];
}

export type ParentNode = NodeWithNonLeafChildren | NodeWithLeafChildren;

export type LeafNode = GVNode;

export interface NodeWithNonLeafChildren {
    id: string;
    label: string;
    children: ParentNode[];
}

export interface NodeWithLeafChildren {
    id: string;
    label: string;
    children: GVNode[];
}
