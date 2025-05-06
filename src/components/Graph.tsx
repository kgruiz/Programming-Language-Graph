import React, { useEffect, useRef } from 'react';
import type { Options } from '@/types';
import styled from '@emotion/styled';
import { VisDataSetNodes, VisDataSetEdges } from '@/types';

declare const vis: any;

interface GraphProps {
    nodesData: VisDataSetNodes | null;
    edgesData: VisDataSetEdges | null;
    options: Options;
    onNodeClick: (nodeId: string | null) => void;
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
    background-color: ${(props) => props.theme.colors.background};
    position: relative;
`;

const GraphComponent: React.FC<GraphProps> = ({
    nodesData,
    edgesData,
    options,
    onNodeClick,
    onStabilizationDone,
    setNetworkInstance,
}) => {
    const graphRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<any | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // console.log("GraphComponent useEffect: Running. nodesData available:", !!nodesData, "edgesData available:", !!edgesData, "nodesData length:", nodesData?.length);
        if (
            typeof window.vis === 'undefined' ||
            !window.vis.Network ||
            !window.vis.DataSet
        ) {
            // console.log("GraphComponent useEffect: vis-network not loaded yet, or not fully.");
            return;
        }

        if (
            graphRef.current &&
            nodesData &&
            edgesData &&
            nodesData.length > 0
        ) {
            // console.log("GraphComponent useEffect: All conditions met, initializing network.");
            if (networkRef.current) {
                // console.log("GraphComponent useEffect: Destroying previous network instance.");
                networkRef.current.destroy();
            }

            try {
                const currentOptions = {
                    // Merge with defaults that might ensure proper sizing
                    ...options,
                    autoResize: true,
                    width: '100%',
                    height: '100%',
                };

                const network = new window.vis.Network(
                    graphRef.current,
                    { nodes: nodesData, edges: edgesData },
                    currentOptions // Use the potentially modified options
                );
                networkRef.current = network;
                // console.log("GraphComponent useEffect: Network initialized successfully.");

                const handleResize = () => {
                    if (resizeTimeoutRef.current) {
                        clearTimeout(resizeTimeoutRef.current);
                    }
                    resizeTimeoutRef.current = setTimeout(() => {
                        if (networkRef.current) {
                            // console.log("GraphComponent: Resizing network (fit)");
                            networkRef.current.fit();
                        }
                    }, 150);
                };

                network.on('click', (params: any) => {
                    if (params.nodes.length > 0) {
                        onNodeClick(params.nodes[0] as string);
                    } else {
                        onNodeClick(null);
                    }
                });

                network.on('stabilizationIterationsDone', () => {
                    // console.log("GraphComponent: stabilizationIterationsDone event - calling fit()");
                    network.fit();
                    onStabilizationDone();
                });

                setTimeout(() => {
                    if (networkRef.current) {
                        // console.log("GraphComponent: Initial fit after short delay");
                        networkRef.current.fit();
                    }
                }, 50);

                window.addEventListener('resize', handleResize);
                setNetworkInstance(network);

                return () => {
                    // console.log("GraphComponent cleanup: Destroying network instance and removing resize listener.");
                    window.removeEventListener('resize', handleResize);
                    if (resizeTimeoutRef.current) {
                        clearTimeout(resizeTimeoutRef.current);
                    }
                    if (networkRef.current) {
                        networkRef.current.destroy();
                    }
                    networkRef.current = null;
                    setNetworkInstance(null);
                };
            } catch (error) {
                console.error(
                    'GraphComponent useEffect: Error initializing vis.Network:',
                    error
                );
            }
        } else {
            // console.log("GraphComponent useEffect: Conditions not met for network initialization.", {
            //     graphRefCurrent: !!graphRef.current,
            //     hasNodesData: !!nodesData,
            //     hasEdgesData: !!edgesData,
            //     nodesDataLength: nodesData?.length
            // });
            if (networkRef.current) {
                // console.log("GraphComponent useEffect: Data became empty/invalid, destroying existing network.");
                networkRef.current.destroy();
                networkRef.current = null;
                setNetworkInstance(null);
            }
        }
    }, [
        nodesData,
        edgesData,
        options, // options is a dependency
        onNodeClick,
        onStabilizationDone,
        setNetworkInstance,
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
