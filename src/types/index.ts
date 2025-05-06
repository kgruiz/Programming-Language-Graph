// Revert DataSet, IdType, Node, Edge to /standalone
import { DataSet, IdType, Node, Edge } from 'vis-network/standalone';

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

export type VisDataSetNodes = DataSet<LanguageNode, 'id'>;
export type VisDataSetEdges = DataSet<InfluenceEdge, 'id'>;
