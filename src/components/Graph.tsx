import React, { useEffect, useRef } from 'react';
import { Network, Options } from 'vis-network/standalone';
import styled from '@emotion/styled';
import {
    LanguageNode,
    InfluenceEdge,
    VisDataSetNodes,
    VisDataSetEdges,
} from '@/types';
import { AppTheme } from '@/styles/theme';

interface GraphProps {
    nodesData: VisDataSetNodes | null;
    edgesData: VisDataSetEdges | null;
    options: Options;
    onNodeClick: (nodeId: string | null) => void;
    onStabilizationDone: () => void;
    setNetworkInstance: (network: Network | null) => void;
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
    const networkRef = useRef<Network | null>(null);

    useEffect(() => {
        if (graphRef.current && nodesData && edgesData) {
            if (networkRef.current) {
                networkRef.current.destroy(); // Destroy previous instance if any
            }
            const network = new Network(
                graphRef.current,
                { nodes: nodesData, edges: edgesData },
                options
            );

            network.on('click', (params) => {
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
            setNetworkInstance(network); // Pass instance to parent

            return () => {
                if (networkRef.current) {
                    networkRef.current.destroy();
                    networkRef.current = null;
                    setNetworkInstance(null);
                }
            };
        }
    }, [
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
