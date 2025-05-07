import React from 'react';
import styled from '@emotion/styled';

const LoadingContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(
        29,
        29,
        31,
        0.6
    ); /* Use theme.colors.backgroundPrimary with alpha */
    z-index: 100; /* High z-index to cover content */
    backdrop-filter: blur(5px) saturate(150%);
    -webkit-backdrop-filter: blur(5px) saturate(150%);
`;

const LoadingSpinner = styled.div`
    border: 3px solid ${(props) => props.theme.colors.backgroundTertiary};
    border-top: 3px solid ${(props) => props.theme.colors.accentBlue};
    border-radius: 50%;
    width: 36px; // Slightly smaller
    height: 36px;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

const LoadingMessage = styled.p`
    margin-top: ${(props) =>
        props.theme.spacing.m}; // Spacing between spinner and text
    font-size: 1em; // Adjusted size
    color: ${(props) => props.theme.colors.contentSecondary};
`;

const LoadingIndicator: React.FC = () => {
    return (
        <LoadingContainer>
            <LoadingSpinner />
            <LoadingMessage>Loading Graph</LoadingMessage>
        </LoadingContainer>
    );
};

export default LoadingIndicator;
