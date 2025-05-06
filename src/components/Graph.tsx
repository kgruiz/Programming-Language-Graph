import React, { useEffect, useRef } from 'react';
// Ensure DataSet, Network, Options are from standalone for consistency with other files
import { Network, Options, DataSet } from 'vis-network/standalone';
import styled from '@emotion/styled';
import {
    VisDataSetNodes,
    VisDataSetEdges,
    LanguageNode, // Import for clarity if needed, though VisDataSetNodes implies it
    InfluenceEdge, // Import for clarity
} from '@/types';

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
        // After this check, nodesData and edgesData are guaranteed to be
        // DataSet<LanguageNode, 'id'> and DataSet<InfluenceEdge, 'id'> respectively.
        if (graphRef.current && nodesData && edgesData) {
            if (networkRef.current) {
                networkRef.current.destroy();
            }

            // Directly use nodesData and edgesData as they are already DataSet instances.
            // The types VisDataSetNodes (DataSet<LanguageNode, 'id'>) and
            // VisDataSetEdges (DataSet<InfluenceEdge, 'id'>) should be compatible
            // with what the Network constructor expects, given LanguageNode extends Node
            // and InfluenceEdge extends Edge from vis-network.
            const network = new Network(
                graphRef.current,
                { nodes: nodesData, edges: edgesData }, // Pass them directly
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
