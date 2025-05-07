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
} from '@/types';
import theme from '@/styles/theme'; // Import theme for direct use in style prop

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
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41-.17-.79-.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
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
}

interface SidebarContainerStyleProps {
    isVisible: boolean;
}

const SidebarContainer = styled.div<SidebarContainerStyleProps>`
    id: details-sidebar;
    width: 380px; // Adjusted width
    max-height: calc(
        100vh - ${(props) => props.theme.spacing.l} - 75px -
            ${(props) => props.theme.spacing.l}
    ); // Top and bottom margins
    background-color: ${(props) => props.theme.colors.sidebarBackground};
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid ${(props) => props.theme.colors.sidebarBorder};
    border-radius: ${(props) => props.theme.borderRadius.large};
    padding: ${(props) => props.theme.spacing.l};
    padding-top: ${(props) =>
        props.theme.spacing.xl}; // More space for close button
    overflow-y: auto;
    color: ${(props) => props.theme.colors.sidebarListItem};
    position: absolute;
    right: ${(props) => props.theme.spacing.l};
    top: calc(
        75px + ${(props) => props.theme.spacing.l}
    ); // Position below controls
    z-index: 1000;
    box-shadow: ${(props) => props.theme.shadows.sidebar};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: ${(props) => (props.isVisible ? 1 : 0)};
    transform: ${(props) =>
        props.isVisible
            ? 'translateX(0)'
            : `translateX(${props.theme.spacing.l})`};
    pointer-events: ${(props) => (props.isVisible ? 'auto' : 'none')};
`;

const CloseButton = styled.button`
    position: absolute;
    top: ${(props) => props.theme.spacing.m};
    right: ${(props) => props.theme.spacing.m};
    background: rgba(0, 0, 0, 0.25);
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
        background-color: rgba(0, 0, 0, 0.35);
        color: ${(props) => props.theme.colors.contentPrimary};
    }
    &:active {
        transform: scale(0.9);
    }
    &:focus,
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px ${(props) => props.theme.colors.accentBlue}4D;
    }
`;

const SidebarTitle = styled.h2`
    margin-top: 0;
    margin-bottom: ${(props) => props.theme.spacing.m};
    font-size: 1.75em;
    color: ${(props) => props.theme.colors.sidebarHeader};
    border-bottom: 1px solid ${(props) => props.theme.colors.separator};
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
        border-radius: ${(props) =>
            props.theme.borderRadius.large}; // Pill shape
        font-size: 0.875em;
        font-weight: 500;
        color: #fff;
        display: flex;
        align-items: center;
        line-height: 1.4;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); // Subtle shadow for tags
    }
`;

const SectionTitle = styled.h3`
    margin-top: ${(props) => props.theme.spacing.l};
    margin-bottom: ${(props) => props.theme.spacing.s};
    font-size: 0.875em;
    color: ${(props) => props.theme.colors.sidebarSubheader};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 ${(props) => props.theme.spacing.l} 0;

    li {
        margin-bottom: ${(props) => props.theme.spacing.s};
        color: ${(props) => props.theme.colors.sidebarListItem};
        font-size: 0.975em;
        line-height: 1.5;
    }
`;

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
}) => {
    const [isRankingsCollapsed, setIsRankingsCollapsed] = useState(false);

    if (!selectedNode || !nodesDataSet || !edgesDataSet) {
        return <SidebarContainer isVisible={false} />;
    }

    const { labelOriginal, goodTagsDisplay, badTagsDisplay } = selectedNode;

    const incomingEdges = edgesDataSet.get({
        filter: (edge: InfluenceEdge) => edge.to === selectedNode.id,
    });
    const influencedBy: string[] = incomingEdges
        .map(
            (edge: InfluenceEdge) => nodesDataSet.get(edge.from)?.labelOriginal
        )
        .filter(Boolean) as string[];

    const outgoingEdges = edgesDataSet.get({
        filter: (edge: InfluenceEdge) => edge.from === selectedNode.id,
    });
    const influences: string[] = outgoingEdges
        .map((edge: InfluenceEdge) => nodesDataSet.get(edge.to)?.labelOriginal)
        .filter(Boolean) as string[];

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
                                backgroundColor: `${theme.colors.accentGreen}33`, // 20% opacity
                                border: `1px solid ${theme.colors.accentGreen}99`, // 60% opacity
                            }}
                        >
                            <ThumbUpIconSmall /> {tag}
                        </li>
                    ))}
                    {badTagsDisplay.map((tag: string) => (
                        <li
                            key={`bad-${tag}`}
                            style={{
                                backgroundColor: `${theme.colors.accentRed}33`,
                                border: `1px solid ${theme.colors.accentRed}99`,
                            }}
                        >
                            <ThumbDownIconSmall /> {tag}
                        </li>
                    ))}
                </LanguageTagsList>
            )}

            <SectionTitle>Influenced By</SectionTitle>
            <List>
                {influencedBy.length > 0 ? (
                    influencedBy.map((name: string) => (
                        <li key={name}>{name}</li>
                    ))
                ) : (
                    <li>None in this graph</li>
                )}
            </List>

            <SectionTitle>Influences</SectionTitle>
            <List>
                {influences.length > 0 ? (
                    influences.map((name: string) => <li key={name}>{name}</li>)
                ) : (
                    <li>None in this graph</li>
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
                                    <strong>{score}</strong> ({legendText})
                                </li>
                            );
                        })
                    ) : (
                        <li>Rankings not available.</li>
                    )}
                </List>
            </CollapsibleContent>

            <SectionTitle>Basic Syntax Example</SectionTitle>
            <PreformattedText>
                {syntaxData[labelOriginal] || 'Syntax example not available.'}
            </PreformattedText>
        </SidebarContainer>
    );
};

export default Sidebar;
