import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
    LanguageNode,
    InfluenceEdge,
    SyntaxData,
    LanguageRankings,
    RankLegend,
    CategoryShortToFullName as CategoryShortToFullNameType,
    VisDataSetNodes,
    VisDataSetEdges,
} from '@/types'; // Types from @/types
// Data for categoriesOrder is not directly needed here, it's passed as a prop
// import { categoriesOrder as defaultCategoriesOrderFromData } from '@/data';

interface SidebarProps {
    selectedNode: LanguageNode | null;
    nodesDataSet: VisDataSetNodes | null;
    edgesDataSet: VisDataSetEdges | null;
    syntaxData: SyntaxData;
    languageRankingsData: LanguageRankings;
    rankLegend: RankLegend;
    categoryMap: CategoryShortToFullNameType;
    categoriesOrder: string[];
    onClose: () => void;
    isVisible: boolean;
}

interface SidebarContainerStyleProps {
    isVisible: boolean;
}

const SidebarContainer = styled.div<SidebarContainerStyleProps>`
    id: details-sidebar;
    width: 420px;
    max-height: calc(100vh - 40px - 75px);
    background-color: ${(props) => props.theme.colors.sidebarBackground};
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 0.5px solid ${(props) => props.theme.colors.sidebarBorder};
    border-radius: 14px;
    padding: 20px;
    overflow-y: auto;
    color: ${(props) => props.theme.colors.sidebarText};
    position: absolute;
    right: 20px;
    top: 80px;
    z-index: 1000;
    box-shadow: ${(props) => props.theme.shadows.sidebar};
    transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    transform: ${(props) =>
        props.isVisible
            ? 'scale(1) translateX(0)'
            : 'scale(0.97) translateX(10px)'};
    pointer-events: ${(props) => (props.isVisible ? 'auto' : 'none')};
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(100, 100, 100, 0.3);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 17px;
    font-weight: normal;
    color: #e0e0e0;
    cursor: pointer;
    padding: 0;
    line-height: 28px;
    text-align: center;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
        background-color: rgba(120, 120, 120, 0.5);
        color: #fff;
    }
`;

const SidebarTitle = styled.h2`
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1.4em;
    color: ${(props) => props.theme.colors.sidebarHeader};
    border-bottom: 1px solid rgba(120, 120, 120, 0.3);
    padding-bottom: 12px;
    font-weight: 600;
`;

const LanguageTagsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 18px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    li {
        padding: 6px 12px;
        border-radius: 15px; /* Pill shape */
        font-size: 0.88em;
        font-weight: 500;
        color: #fff;
        box-shadow: ${(props) => props.theme.shadows.control};
    }
`;

const SectionTitle = styled.h3`
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.05em;
    color: ${(props) => props.theme.colors.sidebarSubheader};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 18px 0;

    li {
        margin-bottom: 7px;
        color: ${(props) => props.theme.colors.sidebarListItem};
        font-size: 0.98em;
    }
`;

const PreformattedText = styled.pre`
    background-color: ${(props) => props.theme.colors.codeBackground};
    border: 1px solid ${(props) => props.theme.colors.codeBorder};
    border-radius: 8px;
    padding: 14px;
    font-family: ${(props) => props.theme.fonts.mono};
    font-size: 0.9em;
    color: ${(props) => props.theme.colors.codeText};
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.45;
    max-height: 300px;
    overflow-y: auto;
`;

const CollapsibleSectionHeader = styled(SectionTitle)`
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface ToggleArrowProps {
    isCollapsed: boolean;
}
const ToggleArrow = styled.span<ToggleArrowProps>`
    display: inline-block;
    transition: transform 0.3s ease;
    font-size: 0.8em;
    color: ${(props) => props.theme.colors.sidebarSubheader};
    transform: ${(props) =>
        props.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
`;

interface CollapsibleContentProps {
    isCollapsed: boolean;
}
const CollapsibleContent = styled.div<CollapsibleContentProps>`
    overflow: hidden;
    max-height: ${(props) => (props.isCollapsed ? '0' : '800px')};
    transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out,
        margin 0.3s ease-in-out;
    padding-top: ${(props) => (props.isCollapsed ? '0' : '5px')};
    padding-bottom: ${(props) => (props.isCollapsed ? '0' : '5px')};
    margin-top: ${(props) => (props.isCollapsed ? '0' : 'auto')};
    margin-bottom: ${(props) => (props.isCollapsed ? '0' : 'auto')};
`;

const Sidebar: React.FC<SidebarProps> = ({
    selectedNode,
    nodesDataSet,
    edgesDataSet,
    syntaxData,
    languageRankingsData,
    rankLegend,
    categoryMap,
    categoriesOrder,
    onClose,
    isVisible,
}) => {
    const [isRankingsCollapsed, setIsRankingsCollapsed] = useState(false);

    if (!selectedNode || !nodesDataSet || !edgesDataSet) {
        return <SidebarContainer isVisible={false} />;
    }

    const { labelOriginal, goodTagsDisplay, badTagsDisplay } = selectedNode;

    const incomingEdges = edgesDataSet.get({
        filter: (edge: InfluenceEdge) => edge.to === selectedNode.id,
    });
    const influencedBy: string[] = incomingEdges // Explicitly type influencedBy as string[]
        .map(
            (edge: InfluenceEdge) => nodesDataSet.get(edge.from)?.labelOriginal
        )
        .filter(Boolean) as string[]; // Assert that filter(Boolean) returns string[]

    const outgoingEdges = edgesDataSet.get({
        filter: (edge: InfluenceEdge) => edge.from === selectedNode.id,
    });
    const influences: string[] = outgoingEdges // Explicitly type influences as string[]
        .map((edge: InfluenceEdge) => nodesDataSet.get(edge.to)?.labelOriginal)
        .filter(Boolean) as string[]; // Assert that filter(Boolean) returns string[]

    const langRankings = languageRankingsData[labelOriginal];

    return (
        <SidebarContainer isVisible={isVisible}>
            <CloseButton onClick={onClose}>×</CloseButton>
            <SidebarTitle>{labelOriginal}</SidebarTitle>

            {(goodTagsDisplay.length > 0 || badTagsDisplay.length > 0) && (
                <LanguageTagsList>
                    {goodTagsDisplay.map((tag: string) => (
                        <li
                            key={`good-${tag}`}
                            style={{
                                backgroundColor: 'rgba(48, 209, 88, 0.25)',
                                border: '1px solid rgba(48, 209, 88, 0.5)',
                            }}
                        >
                            👍 {tag}
                        </li>
                    ))}
                    {badTagsDisplay.map((tag: string) => (
                        <li
                            key={`bad-${tag}`}
                            style={{
                                backgroundColor: 'rgba(255, 69, 58, 0.25)',
                                border: '1px solid rgba(255, 69, 58, 0.5)',
                            }}
                        >
                            👎 {tag}
                        </li>
                    ))}
                </LanguageTagsList>
            )}

            <SectionTitle>Influenced By:</SectionTitle>
            <List>
                {influencedBy.length > 0 ? (
                    influencedBy.map(
                        (
                            name: string // name is now guaranteed to be string
                        ) => <li key={name}>{name}</li>
                    )
                ) : (
                    <li>None in this graph</li>
                )}
            </List>

            <SectionTitle>Influences:</SectionTitle>
            <List>
                {influences.length > 0 ? (
                    influences.map((name: string) => <li key={name}>{name}</li>) // name is now guaranteed to be string
                ) : (
                    <li>None in this graph</li>
                )}
            </List>

            <div className="collapsible-section">
                <CollapsibleSectionHeader
                    onClick={() => setIsRankingsCollapsed(!isRankingsCollapsed)}
                >
                    Category Rankings
                    <ToggleArrow isCollapsed={isRankingsCollapsed}>
                        {isRankingsCollapsed ? '▶' : '▼'}
                    </ToggleArrow>
                </CollapsibleSectionHeader>
                <CollapsibleContent isCollapsed={isRankingsCollapsed}>
                    <List>
                        {langRankings ? (
                            categoriesOrder.map((catShort: string) => {
                                if (langRankings[catShort] === undefined)
                                    return null;
                                const score = langRankings[catShort];
                                const legendText = rankLegend[score] || 'N/A';
                                return (
                                    <li key={catShort}>
                                        {categoryMap[catShort] || catShort}:{' '}
                                        {score} ({legendText})
                                    </li>
                                );
                            })
                        ) : (
                            <li>Rankings not available.</li>
                        )}
                    </List>
                </CollapsibleContent>
            </div>

            <SectionTitle>Basic Syntax Example:</SectionTitle>
            <PreformattedText>
                {syntaxData[labelOriginal] || 'Syntax example not available.'}
            </PreformattedText>
        </SidebarContainer>
    );
};

export default Sidebar;
