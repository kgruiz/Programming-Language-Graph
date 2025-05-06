import React from 'react';
import styled from '@emotion/styled';

const LoadingMessage = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.1em;
    color: ${(props) => props.theme.colors.labelLight};
    z-index: 10;
`;

const LoadingIndicator: React.FC = () => {
    return <LoadingMessage>Loading graph...</LoadingMessage>;
};

export default LoadingIndicator;
