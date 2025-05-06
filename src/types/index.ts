import { DataSet, IdType } from 'vis-network/standalone'; // Import IdType

export interface LanguageNode {
    id: string;
    label: string;
    labelOriginal: string;
    group: string;
    shape: 'box';
    goodAtCategories: string[];
    badAtCategories: string[];
    goodTagsDisplay: string[];
    badTagsDisplay: string[];
    color?: { background?: string; border?: string };
    font?: { color?: string };
    borderWidth?: number;
}

export type LanguageNodes = LanguageNode[];

export interface InfluenceEdge {
    from: string;
    to: string;
    arrows: 'to';
    id?: IdType; // <--- ADD THIS LINE (Optional ID for edges)
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
