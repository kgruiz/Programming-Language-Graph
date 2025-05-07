import React, { useState, useEffect } from 'react';
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
    IdType, // Import IdType
} from '@/types';
import theme from '@/styles/theme';

// ... (Icon components remain the same) ...
const IconWrapperSmall = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    margin-right: ${(props) => props.theme.spacing.xs};
    vertical-align: -0.125em;
    svg {
        width: 100%;
        height: 100%;
    }
`;

const ThumbUpIconSmall = () => (
    <IconWrapperSmall>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                d="M0 0h24v24H0V0z"
                fill="none"
            />
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
        </svg>
    </IconWrapperSmall>
);

const ThumbDownIconSmall = () => (
    <IconWrapperSmall>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                d="M0 0h24v24H0V0z"
                fill="none"
            />
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14-.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41-.17-.79-.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
        </svg>
    </IconWrapperSmall>
);

const CloseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="18px"
        viewBox="0 0 24 24"
        width="18px"
        fill="currentColor"
    >
        <path
            d="M0 0h24v24H0V0z"
            fill="none"
        />
        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12l-2.83-2.83L19 6.41z" />
    </svg>
);

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
    onNavigateToNode: (nodeId: IdType) => void; // New prop
}

// ... (SidebarContainer, CloseButton, SidebarTitle, LanguageTagsList, SectionTitle remain the same)
interface SidebarContainerStyleProps {
    isVisible: boolean;
}

const SidebarContainer = styled.div<SidebarContainerStyleProps>`
    id: details-sidebar;
    width: 380px;
    background-color: ${(props) => props.theme.colors.sidebarBackground};
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid ${(props) => props.theme.colors.sidebarBorder};
    border-radius: ${(props) => props.theme.borderRadius.large};
    padding: ${(props) => props.theme.spacing.l};
    padding-top: calc(
        ${(props) => props.theme.spacing.xl} +
            ${(props) => props.theme.spacing.s}
    );
    overflow-y: auto;
    color: ${(props) => props.theme.colors.sidebarListItem};
    position: absolute;
    right: ${(props) => props.theme.spacing.l};
    top: ${(props) => props.theme.spacing.l};
    max-height: calc(
        100vh - ${(props) => props.theme.spacing.topBarHeight} -
            (2 * ${(props) => props.theme.spacing.l})
    );
    z-index: 1000;
    box-shadow: ${(props) => props.theme.shadows.sidebar};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    transform: ${(props) =>
        props.isVisible
            ? 'translateX(0)'
            : `translateX(calc(100% + ${props.theme.spacing.l}))`};
    pointer-events: ${(props) => (props.isVisible ? 'auto' : 'none')};

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${(props) => props.theme.colors.contentTertiary}66;
        border-radius: ${(props) => props.theme.borderRadius.large};
    }
    &::-webkit-scrollbar-thumb:hover {
        background: ${(props) => props.theme.colors.contentTertiary}99;
    }
    scrollbar-width: thin;
    scrollbar-color: ${(props) => props.theme.colors.contentTertiary}66
        transparent;
`;

const CloseButton = styled.button`
    position: absolute;
    top: ${(props) => props.theme.spacing.m};
    right: ${(props) => props.theme.spacing.m};
    background: rgba(80, 80, 80, 0.5);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: ${(props) => props.theme.colors.contentSecondary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;

    &:hover {
        background-color: rgba(100, 100, 100, 0.6);
        color: ${(props) => props.theme.colors.contentPrimary};
    }
    &:active {
        transform: scale(0.9);
    }
    &:focus,
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px ${(props) => props.theme.colors.accentBlue}66;
    }
`;

const SidebarTitle = styled.h2`
    margin-top: 0;
    margin-bottom: ${(props) => props.theme.spacing.m};
    font-size: 1.85em;
    color: ${(props) => props.theme.colors.sidebarHeader};
    border-bottom: 1px solid ${(props) => props.theme.colors.separator}99;
    padding-bottom: ${(props) => props.theme.spacing.m};
    font-weight: 600;
    line-height: 1.2;
`;

const LanguageTagsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 ${(props) => props.theme.spacing.l} 0;
    display: flex;
    flex-wrap: wrap;
    gap: ${(props) => props.theme.spacing.s};

    li {
        padding: ${(props) => props.theme.spacing.xs}
            ${(props) => props.theme.spacing.m};
        border-radius: ${(props) => props.theme.borderRadius.large};
        font-size: 0.875em;
        font-weight: 500;
        color: ${(props) => props.theme.colors.contentPrimary};
        display: flex;
        align-items: center;
        line-height: 1.4;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
`;

const SectionTitle = styled.h3`
    margin-top: ${(props) => props.theme.spacing.l};
    margin-bottom: ${(props) => props.theme.spacing.s};
    font-size: 0.9em;
    color: ${(props) => props.theme.colors.sidebarSubheader};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 ${(props) => props.theme.spacing.l} 0;
`;

const ListItem = styled.li`
    margin-bottom: ${(props) => props.theme.spacing.s};
    color: ${(props) => props.theme.colors.sidebarListItem};
    font-size: 0.975em;
    line-height: 1.5;

    strong {
        color: ${(props) => props.theme.colors.contentPrimary};
        font-weight: 500;
    }
`;

const ClickableListItem = styled.button`
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font-family: inherit;
    font-size: 0.975em; /* Match ListItem */
    line-height: 1.5; /* Match ListItem */
    color: ${(props) =>
        props.theme.colors.accentBlue}; /* Make it look like a link */
    cursor: pointer;
    text-align: left;
    display: block; /* Make it take full width if needed, or inline */
    width: 100%; /* If you want the whole line clickable */
    margin-bottom: ${(props) => props.theme.spacing.s}; /* Match ListItem */

    &:hover {
        text-decoration: underline;
        color: ${(props) => props.theme.colors.accentBlueHover};
    }
    &:focus,
    &:focus-visible {
        outline: 1px dotted ${(props) => props.theme.colors.accentBlue};
        outline-offset: 2px;
        border-radius: ${(props) => props.theme.borderRadius.small};
    }
`;

// ... (PreformattedText, CollapsibleSectionHeader, ToggleArrow, ArrowIcon, CollapsibleContent remain the same)
const PreformattedText = styled.pre`
    background-color: ${(props) => props.theme.colors.codeBackground};
    border: 1px solid ${(props) => props.theme.colors.codeBorder};
    border-radius: ${(props) => props.theme.borderRadius.medium};
    padding: ${(props) => props.theme.spacing.m};
    font-family: ${(props) => props.theme.fonts.mono};
    font-size: 0.875em;
    color: ${(props) => props.theme.colors.codeText};
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.6;
    max-height: 280px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${(props) => props.theme.colors.contentTertiary}4D;
        border-radius: ${(props) => props.theme.borderRadius.large};
    }
    &::-webkit-scrollbar-thumb:hover {
        background: ${(props) => props.theme.colors.contentTertiary}80;
    }
    scrollbar-width: thin;
    scrollbar-color: ${(props) => props.theme.colors.contentTertiary}4D
        transparent;
`;

const CollapsibleSectionHeader = styled(SectionTitle)`
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${(props) => props.theme.spacing.s} 0;
    transition: color 0.2s ease;
    user-select: none;

    &:hover {
        color: ${(props) => props.theme.colors.contentPrimary};
    }
`;

interface ToggleArrowProps {
    isCollapsed: boolean;
}
const ToggleArrow = styled.span<ToggleArrowProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: ${(props) => props.theme.colors.contentTertiary};
    transform: ${(props) =>
        props.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};

    svg {
        width: 100%;
        height: 100%;
    }
`;

const ArrowIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        {isCollapsed ? (
            <>
                <path
                    d="M0 0h24v24H0V0z"
                    fill="none"
                />
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
            </>
        ) : (
            <>
                <path
                    d="M24 24H0V0h24v24z"
                    fill="none"
                    opacity=".87"
                />
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.59-1.41z" />
            </>
        )}
    </svg>
);

interface CollapsibleContentProps {
    isCollapsed: boolean;
}
const CollapsibleContent = styled.div<CollapsibleContentProps>`
    overflow: hidden;
    max-height: ${(props) => (props.isCollapsed ? '0' : '600px')};
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding-top: ${(props) =>
        props.isCollapsed ? '0' : props.theme.spacing.xs};
    padding-bottom: ${(props) =>
        props.isCollapsed ? '0' : props.theme.spacing.s};
    opacity: ${(props) => (props.isCollapsed ? 0 : 1)};
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
    onNavigateToNode, // Use new prop
}) => {
    const [isRankingsCollapsed, setIsRankingsCollapsed] = useState(true);

    useEffect(() => {
        if (selectedNode) {
            setIsRankingsCollapsed(true);
        }
    }, [selectedNode]);

    if (!selectedNode || !nodesDataSet || !edgesDataSet) {
        return <SidebarContainer isVisible={false} />;
    }

    const {
        id: currentSelectedNodeId,
        labelOriginal,
        goodTagsDisplay,
        badTagsDisplay,
    } = selectedNode;

    // Find IDs for influencedBy and influences languages
    const influencedByNodes: { id: IdType; label: string }[] = edgesDataSet
        .get({
            filter: (edge: InfluenceEdge) => edge.to === currentSelectedNodeId,
        })
        .map((edge: InfluenceEdge) => {
            const node = nodesDataSet.get(edge.from);
            return node ? { id: node.id, label: node.labelOriginal } : null;
        })
        .filter(Boolean) as { id: IdType; label: string }[];

    const influencesNodes: { id: IdType; label: string }[] = edgesDataSet
        .get({
            filter: (edge: InfluenceEdge) =>
                edge.from === currentSelectedNodeId,
        })
        .map((edge: InfluenceEdge) => {
            const node = nodesDataSet.get(edge.to);
            return node ? { id: node.id, label: node.labelOriginal } : null;
        })
        .filter(Boolean) as { id: IdType; label: string }[];

    const langRankings = languageRankingsData[labelOriginal];

    return (
        <SidebarContainer isVisible={isVisible}>
            <CloseButton
                onClick={onClose}
                aria-label="Close details panel"
            >
                <CloseIcon />
            </CloseButton>
            <SidebarTitle>{labelOriginal}</SidebarTitle>

            {(goodTagsDisplay.length > 0 || badTagsDisplay.length > 0) && (
                <LanguageTagsList>
                    {goodTagsDisplay.map((tag: string) => (
                        <li
                            key={`good-${tag}`}
                            style={{
                                backgroundColor: `${theme.colors.accentGreen}E6`,
                                border: `1px solid ${theme.colors.accentGreen}`,
                            }}
                        >
                            <ThumbUpIconSmall /> {tag}
                        </li>
                    ))}
                    {badTagsDisplay.map((tag: string) => (
                        <li
                            key={`bad-${tag}`}
                            style={{
                                backgroundColor: `${theme.colors.accentRed}E6`,
                                border: `1px solid ${theme.colors.accentRed}`,
                            }}
                        >
                            <ThumbDownIconSmall /> {tag}
                        </li>
                    ))}
                </LanguageTagsList>
            )}

            <SectionTitle>Influenced By</SectionTitle>
            <List>
                {influencedByNodes.length > 0 ? (
                    influencedByNodes.map((node) => (
                        <ClickableListItem
                            key={node.id}
                            onClick={() => onNavigateToNode(node.id)}
                        >
                            {node.label}
                        </ClickableListItem>
                    ))
                ) : (
                    <ListItem>None in this graph</ListItem>
                )}
            </List>

            <SectionTitle>Influences</SectionTitle>
            <List>
                {influencesNodes.length > 0 ? (
                    influencesNodes.map((node) => (
                        <ClickableListItem
                            key={node.id}
                            onClick={() => onNavigateToNode(node.id)}
                        >
                            {node.label}
                        </ClickableListItem>
                    ))
                ) : (
                    <ListItem>None in this graph</ListItem>
                )}
            </List>

            <CollapsibleSectionHeader
                onClick={() => setIsRankingsCollapsed(!isRankingsCollapsed)}
                aria-expanded={!isRankingsCollapsed}
            >
                Category Rankings
                <ToggleArrow isCollapsed={isRankingsCollapsed}>
                    <ArrowIcon isCollapsed={isRankingsCollapsed} />
                </ToggleArrow>
            </CollapsibleSectionHeader>
            <CollapsibleContent isCollapsed={isRankingsCollapsed}>
                {langRankings ? (
                    <List>
                        {categoriesOrder.map((catShort: string) => {
                            if (langRankings[catShort] === undefined)
                                return null;
                            const score = langRankings[catShort];
                            const legendText = rankLegend[score] || 'N/A';
                            return (
                                <ListItem key={catShort}>
                                    {categoryMap[catShort] || catShort}:{' '}
                                    <strong>{score}</strong> ({legendText})
                                </ListItem>
                            );
                        })}
                    </List>
                ) : (
                    <List>
                        <ListItem>Rankings not available.</ListItem>
                    </List>
                )}
            </CollapsibleContent>

            <SectionTitle>Basic Syntax Example</SectionTitle>
            <PreformattedText>
                {syntaxData[labelOriginal] || 'Syntax example not available.'}
            </PreformattedText>
        </SidebarContainer>
    );
};

export default Sidebar;
