// Import types from the main 'vis-network' entry for type checking,
// but runtime objects will come from window.vis
import {
    DataSet as VisDataSetConstructor, // Alias to avoid conflict if window.vis.DataSet is typed
    Network as VisNetworkConstructor, // Alias
    IdType,
    Node,
    Edge,
    Options,
    NodeOptions,
    EdgeOptions,
    Color,
    Font,
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

export interface VisNodeStyle {
    color: { background: string; border: string };
    font: { color: string };
    borderWidth: number;
    label: string;
}

export type AllNodesOriginalStyles = Map<string, VisNodeStyle>;

// These types now refer to the constructor types from vis-network for type safety
// The actual instances will be created via window.vis.DataSet
export type VisDataSetNodes = InstanceType<
    typeof VisDataSetConstructor<LanguageNode, 'id'>
>;
export type VisDataSetEdges = InstanceType<
    typeof VisDataSetConstructor<InfluenceEdge, 'id'>
>;

// Extend the global Window interface
declare global {
    interface Window {
        vis: {
            DataSet: typeof VisDataSetConstructor;
            Network: typeof VisNetworkConstructor;
            // Add other vis objects if needed, e.g., util
        };
    }
}

// Re-export Options and other specific types if they are used directly elsewhere
export type { Options, NodeOptions, EdgeOptions, Color, Font, IdType };
