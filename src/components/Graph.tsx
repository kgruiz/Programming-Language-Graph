import React, { useEffect, useRef } from 'react';
import type { Options, IdType } from '@/types'; // Added IdType
import styled from '@emotion/styled';
import { VisDataSetNodes, VisDataSetEdges } from '@/types';

declare const vis: any;

interface GraphClickParams {
    // Define a type for click parameters
    nodes: IdType[];
    edges: IdType[];
    event: any; // Original event
    pointer: {
        DOM: { x: number; y: number };
        canvas: { x: number; y: number };
    };
}

interface GraphProps {
    nodesData: VisDataSetNodes | null;
    edgesData: VisDataSetEdges | null;
    options: Options;
    // Replace onNodeClick with a more general onGraphClick
    onGraphClick: (
        type: 'node' | 'edge' | 'background',
        id: IdType | null,
        params: GraphClickParams
    ) => void;
    onStabilizationDone: () => void;
    setNetworkInstance: (network: any | null) => void;
}

const GraphContainerDiv = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
`;

const LanguageGraphDiv = styled.div`
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: ${(props) => props.theme.colors.backgroundPrimary};
    position: relative;
`;

const GraphComponent: React.FC<GraphProps> = ({
    nodesData,
    edgesData,
    options,
    onGraphClick, // Use the new prop
    onStabilizationDone,
    setNetworkInstance,
}) => {
    const graphRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<any | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (
            typeof window.vis === 'undefined' ||
            !window.vis.Network ||
            !window.vis.DataSet
        ) {
            return;
        }

        if (
            graphRef.current &&
            nodesData &&
            edgesData &&
            nodesData.length > 0
        ) {
            if (networkRef.current) {
                networkRef.current.destroy();
            }

            try {
                const currentOptions = {
                    ...options,
                    autoResize: true,
                    width: '100%',
                    height: '100%',
                };

                const network = new window.vis.Network(
                    graphRef.current,
                    { nodes: nodesData, edges: edgesData },
                    currentOptions
                );
                networkRef.current = network;
                setNetworkInstance(network); // Pass instance up immediately

                const handleResize = () => {
                    if (resizeTimeoutRef.current) {
                        clearTimeout(resizeTimeoutRef.current);
                    }
                    resizeTimeoutRef.current = setTimeout(() => {
                        if (networkRef.current) {
                            networkRef.current.fit();
                        }
                    }, 150);
                };

                // Centralized click handler within GraphComponent
                network.on('click', (params: GraphClickParams) => {
                    console.log('GraphComponent CLICKED (internal):', params); // DEBUG
                    if (params.nodes.length > 0) {
                        onGraphClick('node', params.nodes[0], params);
                    } else if (params.edges.length > 0) {
                        onGraphClick('edge', params.edges[0], params);
                    } else {
                        onGraphClick('background', null, params);
                    }
                });

                network.on('stabilizationIterationsDone', () => {
                    network.fit();
                    onStabilizationDone();
                });

                setTimeout(() => {
                    if (networkRef.current) {
                        networkRef.current.fit();
                    }
                }, 50);

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    if (resizeTimeoutRef.current) {
                        clearTimeout(resizeTimeoutRef.current);
                    }
                    if (networkRef.current) {
                        networkRef.current.destroy();
                    }
                    networkRef.current = null;
                    setNetworkInstance(null); // Clear instance on unmount
                };
            } catch (error) {
                console.error(
                    'GraphComponent useEffect: Error initializing vis.Network:',
                    error
                );
            }
        } else {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
                setNetworkInstance(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Dependencies should be stable if possible
        nodesData, // These can change
        edgesData, // These can change
        options, // Should be memoized in parent if complex
        onGraphClick, // Callback from parent
        onStabilizationDone, // Callback from parent
        setNetworkInstance, // Callback from parent
    ]);

    if (!nodesData || !edgesData) {
        return <GraphContainerDiv>Graph data not ready...</GraphContainerDiv>;
    }
    if (nodesData.length === 0 && edgesData.length === 0) {
        return <GraphContainerDiv>No graph data to display.</GraphContainerDiv>;
    }

    return (
        <GraphContainerDiv>
            <LanguageGraphDiv ref={graphRef} />
        </GraphContainerDiv>
    );
};

export default GraphComponent;
