


export interface GVEdge {
    source: string;
    dest: string;
    colorWeight?: number;
    penWeight?: number;
}

export interface GVNode {
    label: string;
    colorWeight?: number;
    size?: number;
}