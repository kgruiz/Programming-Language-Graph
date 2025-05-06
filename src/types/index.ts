import { DataSet } from 'vis-network/standalone';

export interface LanguageNode {
    id: string;
    label: string; // This will be the display label in the graph
    labelOriginal: string; // The actual language name, used for data lookups
    group: string;
    shape: 'box';
    goodAtCategories: string[];
    badAtCategories: string[];
    goodTagsDisplay: string[];
    badTagsDisplay: string[];
    // Vis-network specific styling properties (optional, can be added by vis-network)
    color?: { background?: string; border?: string };
    font?: { color?: string };
    borderWidth?: number;
}

export type LanguageNodes = LanguageNode[];

export interface InfluenceEdge {
    from: string;
    to: string;
    arrows: 'to';
}

export type InfluenceEdges = InfluenceEdge[];

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

export type VisDataSetNodes = DataSet<LanguageNode>;
export type VisDataSetEdges = DataSet<InfluenceEdge>;
