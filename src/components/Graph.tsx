import React, { useEffect, useRef } from 'react';
import type { Options } from '@/types';
import styled from '@emotion/styled';
import {
    VisDataSetNodes,
    VisDataSetEdges,
    // LanguageNode, // Not strictly needed if VisDataSetNodes is used
    // InfluenceEdge // Not strictly needed if VisDataSetEdges is used
} from '@/types';

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
    flex: 1; // Shorthand for flex-grow: 1, flex-shrink: 1, flex-basis: 0%
    min-height: 0; // Important for flex children that grow
    position: relative;
    overflow: hidden;
`;

const LanguageGraphDiv = styled.div`
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: ${(props) => props.theme.colors.background};
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

    useEffect(() => {
        console.log(
            'GraphComponent useEffect: Running. nodesData available:',
            !!nodesData,
            'edgesData available:',
            !!edgesData,
            'nodesData length:',
            nodesData?.length
        );
        if (
            typeof window.vis === 'undefined' ||
            !window.vis.Network ||
            !window.vis.DataSet
        ) {
            console.log(
                'GraphComponent useEffect: vis-network not loaded yet, or not fully.'
            );
            return;
        }

        if (
            graphRef.current &&
            nodesData &&
            edgesData &&
            nodesData.length > 0
        ) {
            console.log(
                'GraphComponent useEffect: All conditions met, initializing network.'
            );
            if (networkRef.current) {
                console.log(
                    'GraphComponent useEffect: Destroying previous network instance.'
                );
                networkRef.current.destroy();
            }

            try {
                const network = new window.vis.Network(
                    graphRef.current,
                    { nodes: nodesData, edges: edgesData },
                    options
                );
                console.log(
                    'GraphComponent useEffect: Network initialized successfully.'
                );

                network.on('click', (params: any) => {
                    if (params.nodes.length > 0) {
                        onNodeClick(params.nodes[0] as string);
                    } else {
                        onNodeClick(null);
                    }
                });

                network.on('stabilizationIterationsDone', () => {
                    console.log(
                        'GraphComponent: stabilizationIterationsDone event'
                    );
                    onStabilizationDone();
                });

                network.on('afterDrawing', () => {
                    // This log can be spammy, keep it commented out unless actively debugging drawing loops
                    // console.log("GraphComponent: afterDrawing event");
                });

                networkRef.current = network;
                setNetworkInstance(network);
            } catch (error) {
                console.error(
                    'GraphComponent useEffect: Error initializing vis.Network:',
                    error
                );
            }

            return () => {
                if (networkRef.current) {
                    console.log(
                        'GraphComponent cleanup: Destroying network instance.'
                    );
                    networkRef.current.destroy();
                    networkRef.current = null;
                    setNetworkInstance(null);
                }
            };
        } else {
            console.log(
                'GraphComponent useEffect: Conditions not met for network initialization.',
                {
                    graphRefCurrent: !!graphRef.current,
                    hasNodesData: !!nodesData,
                    hasEdgesData: !!edgesData,
                    nodesDataLength: nodesData?.length,
                }
            );
        }
    }, [
        nodesData,
        edgesData,
        options,
        onNodeClick,
        onStabilizationDone,
        setNetworkInstance,
    ]);

    if (!nodesData || !edgesData) {
        return <GraphContainerDiv>Graph data not ready...</GraphContainerDiv>;
    }
    if (nodesData.length === 0 && edgesData.length === 0) {
        // Check edgesData length too
        return <GraphContainerDiv>No graph data to display.</GraphContainerDiv>;
    }

    return (
        <GraphContainerDiv>
            <LanguageGraphDiv ref={graphRef} />
        </GraphContainerDiv>
    );
};

export default GraphComponent;
