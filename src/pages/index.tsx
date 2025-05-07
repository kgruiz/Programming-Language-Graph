import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import styled from '@emotion/styled';

import type {
    Options,
    NodeOptions,
    EdgeOptions,
    Color,
    Font,
    IdType,
} from '@/types';

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
    InfluenceEdge,
} from '@/types';
import theme from '@/styles/theme';

declare const vis: any;

const GraphComponentWithNoSSR = dynamic(() => import('@/components/Graph'), {
    ssr: false,
});

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden; /* Important for containing absolute positioned children like Sidebar */
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
    autoResize: true,
    width: '100%',
    height: '100%',
    layout: {
        hierarchical: {
            enabled: true,
            direction: 'UD',
            sortMethod: 'directed',
            levelSeparation: 190, // Increased
            nodeSpacing: 170, // Increased
            treeSpacing: 250, // Increased
        },
    },
    nodes: {
        shape: 'box',
        font: {
            face: theme.fonts.main,
            size: 14,
            color: theme.colors.nodeText,
            strokeWidth: 0,
        },
        borderWidth: 1.5,
        borderWidthSelected: 3, // Thicker selection border
        shapeProperties: {
            borderRadius: parseInt(theme.borderRadius.medium, 10),
        },
        margin: { top: 14, right: 22, bottom: 14, left: 22 }, // Increased margin
        shadow: {
            enabled: true,
            color: theme.colors.nodeShadow,
            size: 10, // Softer, larger shadow
            x: 4,
            y: 5,
        },
        color: {
            background: theme.colors.nodeBackground,
            border: theme.colors.nodeBorder,
            highlight: {
                background: theme.colors.nodeBackground,
                border: theme.colors.accentBlue,
            },
            hover: {
                background: theme.colors.backgroundTertiary,
                border: theme.colors.nodeBorder,
            },
        },
    },
    edges: {
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.7,
                type: 'arrow',
            },
        },
        smooth: {
            enabled: true,
            type: 'cubicBezier',
            forceDirection: 'vertical',
            roundness: 0.45, // Slightly more curve
        },
        color: {
            color: theme.colors.separator,
            highlight: theme.colors.accentBlue,
            hover: theme.colors.contentTertiary,
            inherit: false,
            opacity: 1,
        },
        width: 1.3, // Slightly thicker edges
        hoverWidth: 2,
        selectionWidth: 2.5,
    },
    physics: { enabled: false },
    interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        tooltipDelay: 250, // Slightly longer delay
        navigationButtons: true,
        keyboard: true,
        selectConnectedEdges: false,
    },
    groups: {
        // Muted, more uniform group colors for Apple style
        c_syntax_algol: { color: { background: '#3A424D', border: '#555E6B' } },
        c_syntax_core: { color: { background: '#3D3D44', border: '#585860' } },
        c_syntax_jvm: { color: { background: '#423C4A', border: '#5D5765' } },
        c_syntax_modern: {
            color: { background: '#384440', border: '#525E5A' },
        },
        c_syntax_script: {
            color: { background: '#384444', border: '#525E5E' },
        },
        lisp: { color: { background: '#4A423D', border: '#655D58' } },
        ml: { color: { background: '#3D4A42', border: '#58655D' } },
        smalltalk: { color: { background: '#4A3D41', border: '#65585C' } },
        stats: { color: { background: '#473D4A', border: '#625865' } },
        array: { color: { background: '#4A3D47', border: '#655862' } },
        shell: { color: { background: '#3D4452', border: '#585E6D' } },
        pascal_like: { color: { background: '#52423D', border: '#6D5D58' } },
        logic: { color: { background: '#473D52', border: '#62586D' } },
        misc: {
            color: {
                background: theme.colors.nodeBackground,
                border: theme.colors.nodeBorder,
            },
        },
        intermediate: { color: { background: '#4F4F4F', border: '#6A6A6A' } },
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
                    background:
                        baseColor.background || theme.colors.nodeBackground,
                    border: theme.colors.accentBlue,
                };
                // More subtle hover for groups
                group.color.hover = {
                    background:
                        baseColor.background || theme.colors.nodeBackground,
                    // Example of slightly lightening a border color if you had tinycolor or similar:
                    // border: baseColor.border ? tinycolor(baseColor.border).lighten(5).toString() : theme.colors.nodeBorder,
                    // For now, just use a predefined hover border or the existing border
                    border: theme.colors.controlHoverBorder, // Or baseColor.border
                };
            }
        }
    );
}

const HomePage: React.FC = () => {
    const [isVisScriptLoaded, setIsVisScriptLoaded] = useState(false);
    const [areDataSetsInitialized, setAreDataSetsInitialized] = useState(false);

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedHighlightCategory, setSelectedHighlightCategory] =
        useState<string>(categoriesOrder[0]);
    const [activeHighlightType, setActiveHighlightType] = useState<
        'good' | 'bad' | null
    >(null);

    const [nodesDataSet, setNodesDataSet] = useState<VisDataSetNodes | null>(
        null
    );
    const [edgesDataSet, setEdgesDataSet] = useState<VisDataSetEdges | null>(
        null
    );

    const allNodesOriginalStylesRef = useRef<AllNodesOriginalStyles>(new Map());
    const networkInstanceRef = useRef<any | null>(null);

    useEffect(() => {
        if (isVisScriptLoaded) {
            if (
                typeof window.vis === 'undefined' ||
                !window.vis.DataSet ||
                !window.vis.Network
            ) {
                console.warn(
                    'Data initialization useEffect: window.vis or its properties (DataSet/Network) are still UNDEFINED even though isVisScriptLoaded is true. Retrying initialization may be needed if script load had issues.'
                );
                return;
            }
            // console.log('Data initialization useEffect: vis script IS loaded and window.vis.DataSet IS available. Processing data...');

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

            const newNodesDataSet = new window.vis.DataSet<LanguageNode, 'id'>(
                processedNodes
            );
            const newEdgesDataSet = new window.vis.DataSet<InfluenceEdge, 'id'>(
                rawEdges
            );

            setNodesDataSet(newNodesDataSet);
            setEdgesDataSet(newEdgesDataSet);
            // console.log('Data initialization useEffect: DataSets created and set to state');

            const tempStyles = new Map<string, VisNodeStyle>();
            newNodesDataSet.forEach((node: LanguageNode) => {
                const groupSettings = graphOptionsBase.groups?.[node.group];
                const defaultNodeStyle = graphOptionsBase.nodes?.color as
                    | Color
                    | undefined;
                const defaultNodeFont = graphOptionsBase.nodes?.font as
                    | Font
                    | undefined;

                let bg =
                    defaultNodeStyle?.background || theme.colors.nodeBackground;
                let bd = defaultNodeStyle?.border || theme.colors.nodeBorder;
                let fontColor = defaultNodeFont?.color || theme.colors.nodeText;

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
                    borderWidth: graphOptionsBase.nodes?.borderWidth || 1.5,
                    label: node.labelOriginal,
                });
            });
            allNodesOriginalStylesRef.current = tempStyles;
            // console.log('Data initialization useEffect: Original styles stored');
            setAreDataSetsInitialized(true);
            // console.log('Data initialization useEffect: setAreDataSetsInitialized(true)');
        } else {
            // console.log('Data initialization useEffect: isVisScriptLoaded is false. Waiting...');
        }
    }, [isVisScriptLoaded]);

    const handleNodeClick = useCallback(
        (nodeId: string | null) => {
            setSelectedNodeId(nodeId);
            // Optionally, if a node is clicked, reset highlights if it's not part of the current highlight
            if (nodeId && activeHighlightType) {
                const node = nodesDataSet?.get(
                    nodeId as IdType
                ) as LanguageNode | null;
                if (node) {
                    const langRankings =
                        languageRankingsData[node.labelOriginal];
                    let isMatch = false;
                    if (
                        langRankings &&
                        langRankings[selectedHighlightCategory] !== undefined
                    ) {
                        const score = langRankings[selectedHighlightCategory];
                        if (activeHighlightType === 'good' && score >= 4)
                            isMatch = true;
                        if (activeHighlightType === 'bad' && score <= 2)
                            isMatch = true;
                    }
                    if (!isMatch) {
                        // If the clicked node is not part of the highlight, reset highlights
                        // This is an opinionated UX choice.
                        // resetNodeHighlights();
                    }
                }
            }
        },
        [activeHighlightType, selectedHighlightCategory, nodesDataSet]
    );

    const handleCloseSidebar = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const handleStabilizationDone = useCallback(() => {
        // console.log('HomePage: stabilizationIterationsDone received by HomePage');
    }, []);

    const setNetwork = useCallback((network: any | null) => {
        networkInstanceRef.current = network;
    }, []);

    const highlightNodes = useCallback(
        (category: string, type: 'good' | 'bad') => {
            if (
                !nodesDataSet ||
                !allNodesOriginalStylesRef.current ||
                !isVisScriptLoaded ||
                !areDataSetsInitialized
            )
                return;

            const updates: Partial<LanguageNode>[] = [];
            nodesDataSet.getIds().forEach((nodeIdUntyped) => {
                const nodeId = nodeIdUntyped as string;
                const node = nodesDataSet.get(nodeId as IdType) as LanguageNode;
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
                                    ? theme.colors.accentGreen
                                    : theme.colors.accentRed,
                            background: (originalStyle.color as Color)
                                .background,
                        },
                        borderWidth: 2.8, // Emphasize highlighted nodes more
                        font: { color: (originalStyle.font as Font).color }, // Keep original font color unless specified
                        shadow: {
                            // Optionally enhance shadow for highlighted nodes
                            enabled: true,
                            color:
                                type === 'good'
                                    ? `${theme.colors.accentGreen}80`
                                    : `${theme.colors.accentRed}80`,
                            size: 12,
                            x: 0,
                            y: 0, // Halo effect
                        },
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
                        shadow: { enabled: false }, // Remove shadow for dimmed nodes for more focus
                    };
                }
                updates.push(newStyle);
            });
            if (updates.length > 0) {
                nodesDataSet.update(updates);
            }
        },
        [isVisScriptLoaded, areDataSetsInitialized, nodesDataSet]
    );

    const resetNodeHighlights = useCallback(() => {
        if (
            !nodesDataSet ||
            !allNodesOriginalStylesRef.current ||
            !isVisScriptLoaded ||
            !areDataSetsInitialized
        )
            return;
        setActiveHighlightType(null);

        const updates: Partial<LanguageNode>[] = [];
        nodesDataSet.getIds().forEach((nodeIdUntyped) => {
            const nodeId = nodeIdUntyped as string;
            const originalStyle = allNodesOriginalStylesRef.current.get(nodeId);
            if (originalStyle) {
                updates.push({
                    id: nodeId as IdType,
                    color: originalStyle.color,
                    font: originalStyle.font,
                    borderWidth: originalStyle.borderWidth,
                    shadow: graphOptionsBase.nodes?.shadow, // Reset to default shadow options
                });
            }
        });
        if (updates.length > 0) {
            nodesDataSet.update(updates);
        }
    }, [isVisScriptLoaded, areDataSetsInitialized, nodesDataSet]);

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

    // Effect to re-apply highlights when category changes while a highlight type is active
    useEffect(() => {
        if (activeHighlightType && selectedHighlightCategory) {
            highlightNodes(selectedHighlightCategory, activeHighlightType);
        }
    }, [selectedHighlightCategory, activeHighlightType, highlightNodes]);

    const selectedNodeDetails =
        selectedNodeId && nodesDataSet
            ? (nodesDataSet.get(selectedNodeId as IdType) as LanguageNode)
            : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectedNodeId && networkInstanceRef.current) {
                const sidebarElement =
                    document.getElementById('details-sidebar');
                const graphElement = document.querySelector(
                    '.vis-network canvas'
                )?.parentElement;

                if (
                    sidebarElement &&
                    !sidebarElement.contains(event.target as Node) &&
                    graphElement &&
                    graphElement.contains(event.target as Node)
                ) {
                    const pointerCoords = (event as any).pointer?.canvas || {
                        x: event.clientX,
                        y: event.clientY,
                    };
                    const clickedNodeId =
                        networkInstanceRef.current.getNodeAt(pointerCoords);
                    if (!clickedNodeId) {
                        // Clicked on graph canvas, but not on a node
                        handleCloseSidebar();
                    }
                } else if (
                    sidebarElement &&
                    !sidebarElement.contains(event.target as Node) &&
                    (!graphElement ||
                        !graphElement.contains(event.target as Node))
                ) {
                    // Clicked outside both sidebar and graph (e.g. on Controls)
                    // Do nothing, or decide if sidebar should close
                }
            }
        };
        if (isVisScriptLoaded) {
            document.addEventListener('click', handleClickOutside, true);
        }
        return () => {
            if (isVisScriptLoaded) {
                document.removeEventListener('click', handleClickOutside, true);
            }
        };
    }, [selectedNodeId, handleCloseSidebar, isVisScriptLoaded]);

    const showLoadingIndicator = !isVisScriptLoaded || !areDataSetsInitialized;

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
            <Script
                src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // console.log('vis-network SCRIPT onLoad: Fired.');
                    if (
                        window.vis &&
                        typeof window.vis.DataSet === 'function' &&
                        typeof window.vis.Network === 'function'
                    ) {
                        // console.log('vis-network SCRIPT onLoad: window.vis.DataSet and window.vis.Network ARE functions.');
                        setIsVisScriptLoaded(true);
                    } else {
                        console.error(
                            'vis-network SCRIPT onLoad: window.vis or its properties (DataSet/Network) are NOT functions or undefined.',
                            {
                                visExists: typeof window.vis !== 'undefined',
                                visDataSetType: typeof window.vis?.DataSet,
                                visNetworkType: typeof window.vis?.Network,
                                visObject: window.vis,
                            }
                        );
                    }
                }}
                onError={(e) => {
                    console.error('Error loading vis-network script:', e);
                }}
            />
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
                    {showLoadingIndicator && <LoadingIndicator />}
                    {isVisScriptLoaded &&
                        areDataSetsInitialized &&
                        nodesDataSet &&
                        edgesDataSet && (
                            <GraphComponentWithNoSSR
                                nodesData={nodesDataSet}
                                edgesData={edgesDataSet}
                                options={graphOptionsBase as Options}
                                onNodeClick={handleNodeClick}
                                onStabilizationDone={handleStabilizationDone}
                                setNetworkInstance={setNetwork}
                            />
                        )}
                    {isVisScriptLoaded && areDataSetsInitialized && (
                        <Sidebar
                            selectedNode={selectedNodeDetails}
                            nodesDataSet={nodesDataSet}
                            edgesDataSet={edgesDataSet}
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
                    )}
                </MainContent>
            </PageContainer>
        </>
    );
};

export default HomePage;
