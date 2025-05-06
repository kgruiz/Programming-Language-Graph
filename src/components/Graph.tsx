import React, { useEffect, useRef } from 'react';
// Types will be used, but constructors will come from window.vis
import type { Options } from '@/types'; // Use re-exported Options type
import styled from '@emotion/styled';
import {
    VisDataSetNodes,
    VisDataSetEdges,
    LanguageNode,
    InfluenceEdge,
} from '@/types';

// Forward declaration for window.vis
declare const vis: any;

interface GraphProps {
    nodesData: VisDataSetNodes | null;
    edgesData: VisDataSetEdges | null;
    options: Options;
    onNodeClick: (nodeId: string | null) => void;
    onStabilizationDone: () => void;
    setNetworkInstance: (network: any | null) => void; // network will be window.vis.Network
}

const GraphContainerDiv = styled.div`
    flex-grow: 1;
    position: relative;
    overflow: hidden;
`;

const LanguageGraphDiv = styled.div`
    width: 100%;
    height: 100%;
    border: none;
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
    const networkRef = useRef<any | null>(null); // Type as any or window.vis.Network

    useEffect(() => {
        if (
            typeof window.vis === 'undefined' ||
            !window.vis.Network ||
            !window.vis.DataSet
        ) {
            // vis-network not loaded yet, or not fully.
            return;
        }

        if (graphRef.current && nodesData && edgesData) {
            if (networkRef.current) {
                networkRef.current.destroy();
            }

            const network = new window.vis.Network(
                graphRef.current,
                { nodes: nodesData, edges: edgesData },
                options
            );

            network.on('click', (params: any) => {
                // params type can be more specific if needed
                if (params.nodes.length > 0) {
                    onNodeClick(params.nodes[0] as string);
                } else {
                    onNodeClick(null);
                }
            });

            network.on('stabilizationIterationsDone', () => {
                onStabilizationDone();
            });

            networkRef.current = network;
            setNetworkInstance(network);

            return () => {
                if (networkRef.current) {
                    networkRef.current.destroy();
                    networkRef.current = null;
                    setNetworkInstance(null);
                }
            };
        }
    }, [
        // Add nodesData and edgesData to dependency array to re-init if they change
        nodesData,
        edgesData,
        options,
        onNodeClick,
        onStabilizationDone,
        setNetworkInstance,
    ]);

    return (
        <GraphContainerDiv>
            <LanguageGraphDiv ref={graphRef} />
        </GraphContainerDiv>
    );
};

export default GraphComponent;
