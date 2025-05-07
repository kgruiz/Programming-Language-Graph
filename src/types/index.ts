import {
    DataSet as VisDataSetConstructor,
    Network as VisNetworkConstructor,
    IdType,
    Node,
    Edge,
    Options,
    NodeOptions,
    EdgeOptions,
    Color as VisNetworkNodeColor, // For nodes (can be complex object)
    // EdgeOptionsColor is not directly exported, use EdgeOptions['color']
    Font,
    ArrowHead,
} from 'vis-network';

export interface LanguageNode extends Node {
    id: IdType;
    label: string;
    labelOriginal: string;
    group: string;
    goodAtCategories: string[];
    badAtCategories: string[];
    goodTagsDisplay: string[];
    badTagsDisplay: string[];
}

export interface InfluenceEdge extends Edge {
    from: IdType;
    to: IdType;
}

export interface SyntaxData {
    [language: string]: string;
}

export interface RankLegend {
    [score: number]: string;
}

export interface CategoryRankings {
    [categoryShort: string]: number;
}

export interface LanguageRankings {
    [language: string]: CategoryRankings;
}

export interface CategoryShortToFullName {
    [shortName: string]: string;
}

// For storing original styles
export interface VisNodeStyle {
    color?: VisNetworkNodeColor | string;
    font?: Font | string;
    borderWidth?: number;
    label: string;
    shadow?: NodeOptions['shadow'];
}

export interface VisEdgeStyle {
    color?: EdgeOptions['color']; // Use EdgeOptions['color'] directly
    width?: number;
    arrows?:
        | string
        | {
              to?: ArrowHead | boolean;
              middle?: ArrowHead | boolean;
              from?: ArrowHead | boolean;
          };
    dashes?: boolean | number[];
    smooth?: EdgeOptions['smooth'];
}

export type AllNodesOriginalStyles = Map<string, VisNodeStyle>;
export type AllEdgesOriginalStyles = Map<string, VisEdgeStyle>;

export type VisDataSetNodes = InstanceType<
    typeof VisDataSetConstructor<LanguageNode, 'id'>
>;
export type VisDataSetEdges = InstanceType<
    typeof VisDataSetConstructor<InfluenceEdge, 'id'>
>;

declare global {
    interface Window {
        vis: {
            DataSet: typeof VisDataSetConstructor;
            Network: typeof VisNetworkConstructor;
        };
    }
}

// Re-export main Color type for nodes as VisNetworkNodeColor for clarity if needed elsewhere
// Do not re-export EdgeOptionsColor as it's not a standalone export from vis-network
export type {
    Options,
    NodeOptions,
    EdgeOptions,
    VisNetworkNodeColor,
    Font,
    IdType,
    ArrowHead,
};
