import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
// Revert DataSet and Network to /standalone, keep Options and other types from the main entry
import {
    DataSet,
    Network,
    Options,
    NodeOptions,
    EdgeOptions,
    Color,
    Font,
    IdType,
} from 'vis-network/standalone';

import Controls from '@/components/Controls';
import Sidebar from '@/components/Sidebar';
import LoadingIndicator from '@/components/LoadingIndicator';

import {
    initialNodesData as rawNodes,
    edgeData as rawEdges,
    syntaxData,
    languageRankingsData,
    rankLegend,
    categoryShortToFullName,
    categoriesOrder,
} from '@/data';

import {
    LanguageNode,
    AllNodesOriginalStyles,
    VisNodeStyle,
    VisDataSetNodes,
    VisDataSetEdges,
    CategoryShortToFullName as CategoryShortToFullNameType,
    InfluenceEdge, // Added back InfluenceEdge for DataSet<InfluenceEdge>
} from '@/types';
import theme from '@/styles/theme';

const GraphComponentWithNoSSR = dynamic(() => import('@/components/Graph'), {
    ssr: false,
});

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
`;

const MainContent = styled.div`
    flex-grow: 1;
    display: flex;
    position: relative;
`;

interface GroupOptionsExtended extends NodeOptions {
    color?:
        | NodeOptions['color']
        | {
              background?: string;
              border?: string;
              highlight?: { background?: string; border?: string };
              hover?: { background?: string; border?: string };
          };
}

interface GraphOptionsExtended extends Options {
    groups?: Record<string, GroupOptionsExtended>;
    nodes?: NodeOptions;
    edges?: EdgeOptions;
}

const graphOptionsBase: GraphOptionsExtended = {
    layout: {
        hierarchical: {
            enabled: true,
            direction: 'UD',
            sortMethod: 'directed',
            levelSeparation: 180,
            nodeSpacing: 160,
            treeSpacing: 240,
        },
    },
    nodes: {
        shape: 'box',
        font: {
            face: theme.fonts.main,
            size: 13,
            color: theme.colors.text,
        },
        borderWidth: 0.8,
        borderWidthSelected: 1.8,
        shapeProperties: { borderRadius: 8 },
        margin: { top: 12, right: 18, bottom: 12, left: 18 },
        shadow: {
            enabled: true,
            color: 'rgba(0, 0, 0, 0.3)',
            size: 7,
            x: 2,
            y: 3,
        },
    },
    edges: {
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.6,
                type: 'arrow',
            },
        },
        smooth: {
            enabled: true,
            type: 'cubicBezier',
            forceDirection: 'vertical',
            roundness: 0.4,
        },
        color: {
            color: '#505053',
            highlight: '#8a8a8e',
            hover: '#6a6a6e',
            inherit: false,
            opacity: 0.85,
        },
        width: 0.9,
        hoverWidth: 1.3,
        selectionWidth: 1.6,
    },
    physics: { enabled: false },
    interaction: {
        dragNodes: false,
        dragView: true,
        zoomView: true,
        tooltipDelay: 200,
        navigationButtons: true,
        keyboard: true,
        selectConnectedEdges: false,
    },
    groups: {
        c_syntax_algol: {
            color: { background: 'rgba(40, 45, 55, 0.9)', border: '#4a5568' },
        },
        c_syntax_core: {
            color: { background: 'rgba(45, 50, 60, 0.9)', border: '#5a6578' },
        },
        c_syntax_jvm: {
            color: { background: 'rgba(50, 45, 65, 0.9)', border: '#6b5f8a' },
        },
        c_syntax_modern: {
            color: { background: 'rgba(40, 55, 50, 0.9)', border: '#486a5f' },
        },
        c_syntax_script: {
            color: { background: 'rgba(40, 55, 55, 0.9)', border: '#4a6b6b' },
        },
        lisp: {
            color: { background: 'rgba(60, 50, 40, 0.9)', border: '#8a705b' },
        },
        ml: {
            color: { background: 'rgba(40, 60, 50, 0.9)', border: '#4a7565' },
        },
        smalltalk: {
            color: { background: 'rgba(60, 40, 45, 0.9)', border: '#8a5b65' },
        },
        stats: {
            color: { background: 'rgba(55, 45, 60, 0.9)', border: '#7a608a' },
        },
        array: {
            color: { background: 'rgba(60, 45, 55, 0.9)', border: '#8a607a' },
        },
        shell: {
            color: { background: 'rgba(45, 50, 65, 0.9)', border: '#5a658a' },
        },
        pascal_like: {
            color: { background: 'rgba(65, 50, 40, 0.9)', border: '#9a705b' },
        },
        logic: {
            color: { background: 'rgba(55, 45, 65, 0.9)', border: '#7a609a' },
        },
        misc: {
            color: { background: 'rgba(55, 55, 55, 0.9)', border: '#777777' },
        },
        intermediate: {
            color: { background: 'rgba(65, 65, 65, 0.9)', border: '#888888' },
        },
    },
};

if (graphOptionsBase.groups) {
    Object.values(graphOptionsBase.groups).forEach(
        (group: GroupOptionsExtended) => {
            if (group.color && typeof group.color === 'object') {
                const baseColor = group.color as {
                    background?: string;
                    border?: string;
                };
                group.color.highlight = {
                    background: baseColor.border,
                    border: baseColor.border,
                };
                group.color.hover = {
                    background: baseColor.background,
                    border: baseColor.border,
                };
            }
        }
    );
}

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedHighlightCategory, setSelectedHighlightCategory] =
        useState<string>(categoriesOrder[0]);
    const [activeHighlightType, setActiveHighlightType] = useState<
        'good' | 'bad' | null
    >(null);

    const nodesDataSetRef = useRef<VisDataSetNodes | null>(null);
    const edgesDataSetRef = useRef<VisDataSetEdges | null>(null);
    const allNodesOriginalStylesRef = useRef<AllNodesOriginalStyles>(new Map());
    const networkInstanceRef = useRef<Network | null>(null);

    useEffect(() => {
        const processedNodes: LanguageNode[] = rawNodes.map((node) => {
            const originalLabel = node.label;
            const langRankings = languageRankingsData[originalLabel];
            const goodAtCategories: string[] = [];
            const badAtCategories: string[] = [];
            const goodTagsDisplay: string[] = [];
            const badTagsDisplay: string[] = [];

            if (langRankings) {
                categoriesOrder.forEach((cat) => {
                    if (langRankings[cat] === undefined) return;
                    if (langRankings[cat] >= 4) {
                        goodAtCategories.push(cat);
                        goodTagsDisplay.push(
                            categoryShortToFullName[cat] || cat
                        );
                    }
                    if (langRankings[cat] <= 2) {
                        badAtCategories.push(cat);
                        badTagsDisplay.push(
                            categoryShortToFullName[cat] || cat
                        );
                    }
                });
            }
            return {
                ...node,
                id: node.id as IdType,
                labelOriginal: originalLabel,
                goodAtCategories,
                badAtCategories,
                goodTagsDisplay,
                badTagsDisplay,
            };
        });

        nodesDataSetRef.current = new DataSet<LanguageNode, 'id'>(
            processedNodes
        );
        edgesDataSetRef.current = new DataSet<InfluenceEdge, 'id'>(rawEdges);

        const tempStyles = new Map<string, VisNodeStyle>();
        nodesDataSetRef.current.forEach((node: LanguageNode) => {
            const groupSettings = graphOptionsBase.groups?.[node.group];
            let bg =
                (graphOptionsBase.nodes?.color as Color)?.background ||
                'rgba(55, 55, 55, 0.9)';
            let bd =
                (graphOptionsBase.nodes?.color as Color)?.border || '#777777';
            let fontColor =
                (graphOptionsBase.nodes?.font as Font)?.color ||
                theme.colors.text;

            if (
                groupSettings?.color &&
                typeof groupSettings.color === 'object'
            ) {
                const grpColor = groupSettings.color as {
                    background?: string;
                    border?: string;
                };
                bg = grpColor.background || bg;
                bd = grpColor.border || bd;
            }
            tempStyles.set(node.id as string, {
                color: { background: bg, border: bd },
                font: { color: fontColor },
                borderWidth: graphOptionsBase.nodes?.borderWidth || 0.8,
                label: node.labelOriginal,
            });
        });
        allNodesOriginalStylesRef.current = tempStyles;

        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleNodeClick = useCallback((nodeId: string | null) => {
        setSelectedNodeId(nodeId);
    }, []);

    const handleCloseSidebar = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const handleStabilizationDone = useCallback(() => {
        setIsLoading(false);
    }, []);

    const setNetwork = useCallback((network: Network | null) => {
        networkInstanceRef.current = network;
    }, []);

    const highlightNodes = useCallback(
        (category: string, type: 'good' | 'bad') => {
            if (!nodesDataSetRef.current || !allNodesOriginalStylesRef.current)
                return;

            const updates: Partial<LanguageNode>[] = [];
            nodesDataSetRef.current.getIds().forEach((nodeIdUntyped) => {
                const nodeId = nodeIdUntyped as string;
                const node = nodesDataSetRef.current!.get(
                    nodeId as IdType
                ) as LanguageNode;
                const originalStyle =
                    allNodesOriginalStylesRef.current.get(nodeId);
                if (!node || !originalStyle) return;

                const langRankings = languageRankingsData[node.labelOriginal];
                let isMatch = false;

                if (langRankings && langRankings[category] !== undefined) {
                    const score = langRankings[category];
                    if (type === 'good' && score >= 4) isMatch = true;
                    if (type === 'bad' && score <= 2) isMatch = true;
                }

                let newStyle: Partial<LanguageNode>;
                if (isMatch) {
                    newStyle = {
                        id: node.id,
                        color: {
                            border:
                                type === 'good'
                                    ? theme.colors.highlightGood
                                    : theme.colors.highlightBad,
                            background: (originalStyle.color as Color)
                                .background,
                        },
                        borderWidth: 2.5,
                        font: { color: (originalStyle.font as Font).color },
                    };
                } else {
                    newStyle = {
                        id: node.id,
                        color: {
                            background: theme.colors.dimmedNodeBackground,
                            border: theme.colors.dimmedNodeBorder,
                        },
                        borderWidth: originalStyle.borderWidth,
                        font: { color: theme.colors.dimmedNodeText },
                    };
                }
                updates.push(newStyle);
            });
            if (updates.length > 0) {
                nodesDataSetRef.current.update(updates);
            }
        },
        []
    );

    const resetNodeHighlights = useCallback(() => {
        if (!nodesDataSetRef.current || !allNodesOriginalStylesRef.current)
            return;
        setActiveHighlightType(null);

        const updates: Partial<LanguageNode>[] = [];
        nodesDataSetRef.current.getIds().forEach((nodeIdUntyped) => {
            const nodeId = nodeIdUntyped as string;
            const originalStyle = allNodesOriginalStylesRef.current.get(nodeId);
            if (originalStyle) {
                updates.push({
                    id: nodeId as IdType,
                    color: originalStyle.color,
                    font: originalStyle.font,
                    borderWidth: originalStyle.borderWidth,
                });
            }
        });
        if (updates.length > 0) {
            nodesDataSetRef.current.update(updates);
        }
    }, []);

    const handleHighlightGood = () => {
        if (activeHighlightType === 'good' && selectedHighlightCategory) {
            resetNodeHighlights();
        } else {
            highlightNodes(selectedHighlightCategory, 'good');
            setActiveHighlightType('good');
        }
    };

    const handleHighlightBad = () => {
        if (activeHighlightType === 'bad' && selectedHighlightCategory) {
            resetNodeHighlights();
        } else {
            highlightNodes(selectedHighlightCategory, 'bad');
            setActiveHighlightType('bad');
        }
    };

    const selectedNodeDetails = selectedNodeId
        ? (nodesDataSetRef.current?.get(
              selectedNodeId as IdType
          ) as LanguageNode)
        : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectedNodeId) {
                const sidebarElement =
                    document.getElementById('details-sidebar');
                const graphElement = document.querySelector(
                    '.vis-network canvas'
                )?.parentElement;

                if (
                    sidebarElement &&
                    !sidebarElement.contains(event.target as Node) &&
                    graphElement &&
                    graphElement.contains(event.target as Node) &&
                    networkInstanceRef.current &&
                    typeof networkInstanceRef.current.getNodeAt ===
                        'function' &&
                    !networkInstanceRef.current.getNodeAt(
                        (event as any).pointer?.canvas || {
                            x: event.clientX,
                            y: event.clientY,
                        }
                    )
                ) {
                    handleCloseSidebar();
                }
            }
        };
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [selectedNodeId, handleCloseSidebar]);

    return (
        <>
            <Head>
                <title>Programming Language Graph</title>
                <meta
                    name="description"
                    content="Interactive graph of programming language influences and rankings."
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
            </Head>
            <PageContainer>
                <Controls
                    categories={categoriesOrder}
                    categoryMap={
                        categoryShortToFullName as CategoryShortToFullNameType
                    }
                    selectedCategory={selectedHighlightCategory}
                    onCategoryChange={setSelectedHighlightCategory}
                    onHighlightGood={handleHighlightGood}
                    onHighlightBad={handleHighlightBad}
                    onResetHighlights={resetNodeHighlights}
                    activeHighlightType={activeHighlightType || undefined}
                />
                <MainContent>
                    {isLoading && <LoadingIndicator />}
                    <GraphComponentWithNoSSR
                        nodesData={nodesDataSetRef.current}
                        edgesData={edgesDataSetRef.current}
                        options={graphOptionsBase as Options}
                        onNodeClick={handleNodeClick}
                        onStabilizationDone={handleStabilizationDone}
                        setNetworkInstance={setNetwork}
                    />
                    <Sidebar
                        selectedNode={selectedNodeDetails}
                        nodesDataSet={nodesDataSetRef.current}
                        edgesDataSet={edgesDataSetRef.current}
                        syntaxData={syntaxData}
                        languageRankingsData={languageRankingsData}
                        rankLegend={rankLegend}
                        categoryMap={
                            categoryShortToFullName as CategoryShortToFullNameType
                        }
                        categoriesOrder={categoriesOrder}
                        onClose={handleCloseSidebar}
                        isVisible={!!selectedNodeId}
                    />
                </MainContent>
            </PageContainer>
        </>
    );
};

export default HomePage;
