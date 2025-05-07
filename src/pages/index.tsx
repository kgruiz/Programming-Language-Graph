import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import styled from '@emotion/styled';

import type {
    Options,
    NodeOptions,
    EdgeOptions,
    VisNetworkNodeColor,
    Font,
    IdType,
    ArrowHead,
} from '@/types';

import ControlsComponent from '@/components/Controls';
import Sidebar from '@/components/Sidebar';
import LoadingIndicator from '@/components/LoadingIndicator';
import NavigationControls from '@/components/NavigationControls';

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
    InfluenceEdge,
    AllNodesOriginalStyles,
    AllEdgesOriginalStyles,
    VisNodeStyle,
    VisEdgeStyle,
    VisDataSetNodes,
    VisDataSetEdges,
    CategoryShortToFullName as CategoryShortToFullNameType,
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
    background-color: ${(props) => props.theme.colors.backgroundPrimary};
`;

const ControlsWrapper = styled.div`
    height: ${(props) => props.theme.spacing.topBarHeight};
    flex-shrink: 0;
    position: relative;
    z-index: 20;
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
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
            levelSeparation: 200,
            nodeSpacing: 180,
            treeSpacing: 260,
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
        borderWidthSelected: 3,
        shapeProperties: {
            borderRadius: parseInt(theme.borderRadius.medium, 10),
        },
        margin: { top: 15, right: 25, bottom: 15, left: 25 },
        shadow: {
            enabled: true,
            color: theme.colors.nodeShadow,
            size: 8,
            x: 3,
            y: 4,
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
                scaleFactor: 0.75,
                type: 'arrow',
            },
        } as EdgeOptions['arrows'],
        smooth: {
            enabled: true,
            type: 'cubicBezier',
            forceDirection: 'vertical',
            roundness: 0.5,
        },
        color: {
            color: theme.colors.separator,
            highlight: theme.colors.accentBlue,
            hover: theme.colors.contentTertiary,
            inherit: false,
            opacity: 0.8,
        },
        width: 1.5,
        hoverWidth: 2.2,
        selectionWidth: 2.8,
    },
    physics: { enabled: false },
    interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        tooltipDelay: 300,
        navigationButtons: false,
        keyboard: true,
        selectConnectedEdges: false,
    },
    groups: {
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
                group.color.hover = {
                    background: baseColor.background
                        ? theme.colors.backgroundTertiary
                        : theme.colors.backgroundTertiary,
                    border: baseColor.border || theme.colors.nodeBorder,
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
    const allEdgesOriginalStylesRef = useRef<AllEdgesOriginalStyles>(new Map());
    const networkInstanceRef = useRef<any | null>(null);

    useEffect(() => {
        if (isVisScriptLoaded) {
            if (!window.vis?.DataSet || !window.vis?.Network) return;

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

            const tempNodeStyles = new Map<string, VisNodeStyle>();
            newNodesDataSet.forEach((node: LanguageNode) => {
                const groupSettings = graphOptionsBase.groups?.[node.group];
                let nodeColorStyle: VisNetworkNodeColor | string | undefined =
                    graphOptionsBase.nodes?.color;
                if (groupSettings?.color) {
                    nodeColorStyle = groupSettings.color;
                }

                tempNodeStyles.set(node.id as string, {
                    color: nodeColorStyle || {
                        background: theme.colors.nodeBackground,
                        border: theme.colors.nodeBorder,
                    },
                    font: graphOptionsBase.nodes?.font || {
                        color: theme.colors.nodeText,
                        size: 14,
                    },
                    borderWidth: graphOptionsBase.nodes?.borderWidth || 1.5,
                    label: node.labelOriginal,
                    shadow: graphOptionsBase.nodes?.shadow,
                });
            });
            allNodesOriginalStylesRef.current = tempNodeStyles;

            const tempEdgeStyles = new Map<string, VisEdgeStyle>();
            newEdgesDataSet.forEach((edge: InfluenceEdge) => {
                const baseEdgeColorOptions = graphOptionsBase.edges?.color as
                    | EdgeOptions['color']
                    | undefined;
                let edgeColorToStore: EdgeOptions['color'] | undefined =
                    theme.colors.separator;

                if (typeof baseEdgeColorOptions === 'string') {
                    edgeColorToStore = baseEdgeColorOptions;
                } else if (typeof baseEdgeColorOptions === 'object') {
                    edgeColorToStore = { ...baseEdgeColorOptions };
                }

                tempEdgeStyles.set(edge.id as string, {
                    color: edgeColorToStore,
                    width: graphOptionsBase.edges?.width || 1.5,
                    arrows: graphOptionsBase.edges
                        ?.arrows as VisEdgeStyle['arrows'],
                    smooth: graphOptionsBase.edges?.smooth,
                });
            });
            allEdgesOriginalStylesRef.current = tempEdgeStyles;

            setAreDataSetsInitialized(true);
        }
    }, [isVisScriptLoaded]);

    const resetAllGraphElementsToOriginalStyle = useCallback(() => {
        if (!nodesDataSet || !edgesDataSet || !areDataSetsInitialized) return;

        const nodeUpdates: Partial<LanguageNode>[] = [];
        allNodesOriginalStylesRef.current.forEach((style, id) => {
            nodeUpdates.push({
                id: id as IdType,
                ...style,
            } as Partial<LanguageNode>);
        });
        if (nodeUpdates.length > 0) nodesDataSet.update(nodeUpdates);

        const edgeUpdates: Partial<InfluenceEdge>[] = [];
        allEdgesOriginalStylesRef.current.forEach((style, id) => {
            edgeUpdates.push({
                id: id as IdType,
                ...style,
            } as Partial<InfluenceEdge>);
        });
        if (edgeUpdates.length > 0) edgesDataSet.update(edgeUpdates);

        setActiveHighlightType(null);
    }, [nodesDataSet, edgesDataSet, areDataSetsInitialized]);

    const highlightNodeLineage = useCallback(
        (nodeId: string) => {
            if (!nodesDataSet || !edgesDataSet || !areDataSetsInitialized)
                return;
            resetAllGraphElementsToOriginalStyle();

            const nodeUpdates: Partial<LanguageNode>[] = [];
            const edgeUpdates: Partial<InfluenceEdge>[] = [];

            allNodesOriginalStylesRef.current.forEach((origStyle, id) => {
                nodeUpdates.push({
                    id: id as IdType,
                    color: {
                        background: theme.colors.dimmedNodeBackground,
                        border: theme.colors.dimmedNodeBorder,
                    } as VisNetworkNodeColor,
                    font: { color: theme.colors.dimmedNodeText },
                    shadow: { enabled: false },
                });
            });
            allEdgesOriginalStylesRef.current.forEach((origStyle, id) => {
                edgeUpdates.push({
                    id: id as IdType,
                    color: {
                        color: theme.colors.dimmedEdgeColor,
                        opacity: 0.3,
                    } as EdgeOptions['color'],
                    width: (origStyle.width || 1.5) * 0.8,
                    arrows: origStyle.arrows,
                    smooth: origStyle.smooth,
                });
            });

            const selectedNodeOriginalStyle =
                allNodesOriginalStylesRef.current.get(nodeId);
            if (selectedNodeOriginalStyle) {
                nodeUpdates.push({
                    id: nodeId as IdType,
                    color: {
                        background:
                            (
                                selectedNodeOriginalStyle.color as VisNetworkNodeColor
                            )?.background || theme.colors.nodeBackground,
                        border: theme.colors.accentBlue,
                    },
                    font: selectedNodeOriginalStyle.font,
                    borderWidth: 3,
                    shadow: {
                        enabled: true,
                        color: `${theme.colors.accentBlue}99`,
                        size: 12,
                        x: 0,
                        y: 0,
                    },
                });
            }

            edgesDataSet
                ?.get({ filter: (edge) => edge.to === nodeId })
                .forEach((edge) => {
                    const parentId = edge.from as string;
                    const parentNodeOriginalStyle =
                        allNodesOriginalStylesRef.current.get(parentId);
                    if (parentNodeOriginalStyle) {
                        nodeUpdates.push({
                            id: parentId as IdType,
                            color: {
                                background:
                                    (
                                        parentNodeOriginalStyle.color as VisNetworkNodeColor
                                    )?.background ||
                                    theme.colors.nodeBackground,
                                border: theme.colors.accentPurple,
                            },
                            font: parentNodeOriginalStyle.font,
                            borderWidth: 2.5,
                            shadow: {
                                enabled: true,
                                color: `${theme.colors.accentPurple}80`,
                                size: 10,
                                x: 0,
                                y: 0,
                            },
                        });
                    }
                    edgeUpdates.push({
                        id: edge.id,
                        color: {
                            color: theme.colors.accentPurple,
                            opacity: 1,
                        } as EdgeOptions['color'],
                        width: 2.5,
                    });
                });

            edgesDataSet
                ?.get({ filter: (edge) => edge.from === nodeId })
                .forEach((edge) => {
                    const childId = edge.to as string;
                    const childNodeOriginalStyle =
                        allNodesOriginalStylesRef.current.get(childId);
                    if (childNodeOriginalStyle) {
                        nodeUpdates.push({
                            id: childId as IdType,
                            color: {
                                background:
                                    (
                                        childNodeOriginalStyle.color as VisNetworkNodeColor
                                    )?.background ||
                                    theme.colors.nodeBackground,
                                border: theme.colors.accentOrange,
                            },
                            font: childNodeOriginalStyle.font,
                            borderWidth: 2.5,
                            shadow: {
                                enabled: true,
                                color: `${theme.colors.accentOrange}80`,
                                size: 10,
                                x: 0,
                                y: 0,
                            },
                        });
                    }
                    edgeUpdates.push({
                        id: edge.id,
                        color: {
                            color: theme.colors.accentOrange,
                            opacity: 1,
                        } as EdgeOptions['color'],
                        width: 2.5,
                    });
                });

            if (nodeUpdates.length > 0) nodesDataSet.update(nodeUpdates);
            if (edgeUpdates.length > 0 && edgesDataSet)
                edgesDataSet.update(edgeUpdates);
        },
        [
            nodesDataSet,
            edgesDataSet,
            areDataSetsInitialized,
            resetAllGraphElementsToOriginalStyle,
        ]
    );

    const highlightCategoryNodes = useCallback(
        (category: string, type: 'good' | 'bad') => {
            if (!nodesDataSet || !areDataSetsInitialized) return;
            resetAllGraphElementsToOriginalStyle();

            const nodeUpdates: Partial<LanguageNode>[] = [];
            const edgeUpdates: Partial<InfluenceEdge>[] = [];

            allEdgesOriginalStylesRef.current.forEach((origStyle, id) => {
                edgeUpdates.push({
                    id: id as IdType,
                    color: {
                        color: theme.colors.dimmedEdgeColor,
                        opacity: 0.3,
                    } as EdgeOptions['color'],
                    width: (origStyle.width || 1.5) * 0.8,
                });
            });

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

                if (isMatch) {
                    nodeUpdates.push({
                        id: node.id,
                        color: {
                            border:
                                type === 'good'
                                    ? theme.colors.accentGreen
                                    : theme.colors.accentRed,
                            background:
                                (originalStyle.color as VisNetworkNodeColor)
                                    ?.background || theme.colors.nodeBackground,
                        },
                        borderWidth: 2.8,
                        font: originalStyle.font,
                        shadow: {
                            enabled: true,
                            color:
                                type === 'good'
                                    ? `${theme.colors.accentGreen}99`
                                    : `${theme.colors.accentRed}99`,
                            size: 12,
                            x: 0,
                            y: 0,
                        },
                    });
                } else {
                    nodeUpdates.push({
                        id: node.id,
                        color: {
                            background: theme.colors.dimmedNodeBackground,
                            border: theme.colors.dimmedNodeBorder,
                        },
                        borderWidth: originalStyle.borderWidth,
                        font: { color: theme.colors.dimmedNodeText },
                        shadow: { enabled: false },
                    });
                }
            });
            if (nodeUpdates.length > 0) nodesDataSet.update(nodeUpdates);
            if (edgeUpdates.length > 0 && edgesDataSet)
                edgesDataSet.update(edgeUpdates);
        },
        [
            nodesDataSet,
            edgesDataSet,
            areDataSetsInitialized,
            resetAllGraphElementsToOriginalStyle,
        ]
    );

    const handleGraphClick = useCallback(
        (
            type: 'node' | 'edge' | 'background',
            id: IdType | null,
            params: any
        ) => {
            if (type === 'node' && id) {
                setSelectedNodeId(id as string);
                highlightNodeLineage(id as string);
                setActiveHighlightType(null);
            } else if (type === 'edge' && id && edgesDataSet && nodesDataSet) {
                const clickedEdgeId = id;
                const edge = edgesDataSet.get(clickedEdgeId) as InfluenceEdge;
                if (edge) {
                    resetAllGraphElementsToOriginalStyle();
                    setActiveHighlightType(null);

                    const nodeUpdates: Partial<LanguageNode>[] = [];
                    const edgeUpdates: Partial<InfluenceEdge>[] = [];

                    allNodesOriginalStylesRef.current.forEach(
                        (origStyle, nId) => {
                            nodeUpdates.push({
                                id: nId as IdType,
                                color: {
                                    background:
                                        theme.colors.dimmedNodeBackground,
                                    border: theme.colors.dimmedNodeBorder,
                                },
                                font: { color: theme.colors.dimmedNodeText },
                                shadow: { enabled: false },
                            });
                        }
                    );
                    allEdgesOriginalStylesRef.current.forEach(
                        (origStyle, eId) => {
                            if (eId !== clickedEdgeId) {
                                edgeUpdates.push({
                                    id: eId as IdType,
                                    color: {
                                        color: theme.colors.dimmedEdgeColor,
                                        opacity: 0.3,
                                    } as EdgeOptions['color'],
                                    width: (origStyle.width || 1.5) * 0.8,
                                });
                            }
                        }
                    );

                    const fromNodeOriginalStyle =
                        allNodesOriginalStylesRef.current.get(
                            edge.from as string
                        );
                    if (fromNodeOriginalStyle) {
                        nodeUpdates.push({
                            id: edge.from,
                            color: {
                                background: (
                                    fromNodeOriginalStyle.color as VisNetworkNodeColor
                                )?.background,
                                border: theme.colors.accentPurple,
                            },
                            font: fromNodeOriginalStyle.font,
                            borderWidth: 2.5,
                            shadow: {
                                enabled: true,
                                color: `${theme.colors.accentPurple}80`,
                                size: 10,
                                x: 0,
                                y: 0,
                            },
                        });
                    }
                    const toNodeOriginalStyle =
                        allNodesOriginalStylesRef.current.get(
                            edge.to as string
                        );
                    if (toNodeOriginalStyle) {
                        nodeUpdates.push({
                            id: edge.to,
                            color: {
                                background: (
                                    toNodeOriginalStyle.color as VisNetworkNodeColor
                                )?.background,
                                border: theme.colors.accentOrange,
                            },
                            font: toNodeOriginalStyle.font,
                            borderWidth: 2.5,
                            shadow: {
                                enabled: true,
                                color: `${theme.colors.accentOrange}80`,
                                size: 10,
                                x: 0,
                                y: 0,
                            },
                        });
                    }
                    edgeUpdates.push({
                        id: clickedEdgeId,
                        color: {
                            color: theme.colors.accentBlue,
                            opacity: 1,
                        } as EdgeOptions['color'],
                        width: 3,
                    });

                    if (nodeUpdates.length > 0)
                        nodesDataSet.update(nodeUpdates);
                    if (edgeUpdates.length > 0)
                        edgesDataSet.update(edgeUpdates);

                    setSelectedNodeId(null);
                    setActiveHighlightType(null);
                }
            } else if (type === 'background') {
                setSelectedNodeId(null);
                resetAllGraphElementsToOriginalStyle();
            }
        },
        [
            highlightNodeLineage,
            resetAllGraphElementsToOriginalStyle,
            setSelectedNodeId,
            setActiveHighlightType,
            nodesDataSet,
            edgesDataSet,
        ]
    );

    const handleNavigateToNodeFromSidebar = useCallback(
        (nodeId: IdType) => {
            if (networkInstanceRef.current && nodesDataSet?.get(nodeId)) {
                setSelectedNodeId(nodeId as string);
                highlightNodeLineage(nodeId as string);
                setActiveHighlightType(null);

                networkInstanceRef.current.focus(nodeId, {
                    scale: 1.2,
                    animation: {
                        duration: 800,
                        easingFunction: 'easeInOutQuad',
                    },
                });
            }
        },
        [
            highlightNodeLineage,
            setSelectedNodeId,
            setActiveHighlightType,
            nodesDataSet,
        ]
    );

    const handleCloseSidebar = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const handleStabilizationDone = useCallback(() => {}, []);
    const setNetwork = useCallback((network: any | null) => {
        networkInstanceRef.current = network;
    }, []);

    const handleHighlightGood = () => {
        if (activeHighlightType === 'good' && selectedHighlightCategory) {
            resetAllGraphElementsToOriginalStyle();
        } else {
            highlightCategoryNodes(selectedHighlightCategory, 'good');
            setActiveHighlightType('good');
            setSelectedNodeId(null);
        }
    };

    const handleHighlightBad = () => {
        if (activeHighlightType === 'bad' && selectedHighlightCategory) {
            resetAllGraphElementsToOriginalStyle();
        } else {
            highlightCategoryNodes(selectedHighlightCategory, 'bad');
            setActiveHighlightType('bad');
            setSelectedNodeId(null);
        }
    };

    useEffect(() => {
        if (activeHighlightType && selectedHighlightCategory) {
            highlightCategoryNodes(
                selectedHighlightCategory,
                activeHighlightType
            );
        }
    }, [
        selectedHighlightCategory,
        activeHighlightType,
        highlightCategoryNodes,
    ]);

    // Navigation callbacks for custom buttons
    const handleZoomIn = useCallback(() => {
        // Corrected: Access view methods via network.view
        networkInstanceRef.current?.view?.zoomIn();
    }, []);
    const handleZoomOut = useCallback(() => {
        // Corrected: Access view methods via network.view
        networkInstanceRef.current?.view?.zoomOut();
    }, []);
    const handleFit = useCallback(() => {
        // Corrected: Access view methods via network.view
        networkInstanceRef.current?.view?.fit();
    }, []);

    const selectedNodeDetails =
        selectedNodeId && nodesDataSet
            ? (nodesDataSet.get(selectedNodeId as IdType) as LanguageNode)
            : null;
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
                    if (window.vis?.DataSet && window.vis?.Network)
                        setIsVisScriptLoaded(true);
                    else
                        console.error(
                            'vis-network script loaded but window.vis not fully initialized.'
                        );
                }}
                onError={(e) =>
                    console.error('Error loading vis-network script:', e)
                }
            />
            <PageContainer>
                <ControlsWrapper>
                    <ControlsComponent
                        categories={categoriesOrder}
                        categoryMap={
                            categoryShortToFullName as CategoryShortToFullNameType
                        }
                        selectedCategory={selectedHighlightCategory}
                        onCategoryChange={setSelectedHighlightCategory}
                        onHighlightGood={handleHighlightGood}
                        onHighlightBad={handleHighlightBad}
                        onResetHighlights={resetAllGraphElementsToOriginalStyle}
                        activeHighlightType={activeHighlightType || undefined}
                    />
                </ControlsWrapper>
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
                                onGraphClick={handleGraphClick}
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
                            onNavigateToNode={handleNavigateToNodeFromSidebar}
                        />
                    )}
                    {isVisScriptLoaded && areDataSetsInitialized && (
                        <NavigationControls
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onFit={handleFit}
                            isNetworkReady={!!networkInstanceRef.current}
                        />
                    )}
                </MainContent>
            </PageContainer>
        </>
    );
};

export default HomePage;
