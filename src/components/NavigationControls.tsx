import React from 'react';
import styled from '@emotion/styled';

const ControlsContainer = styled.div`
    position: absolute;
    bottom: ${(props) => props.theme.spacing.l};
    right: ${(props) => props.theme.spacing.l};
    z-index: 10; // Ensure above graph, but potentially below modals
    background-color: ${(props) =>
        props.theme.colors.visNavButtonBackground}; /* Use existing theme var */
    border: 1px solid ${(props) => props.theme.colors.visNavButtonBorder};
    border-radius: ${(props) => props.theme.borderRadius.large};
    padding: ${(props) => props.theme.spacing.s};
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    box-shadow: ${(props) => props.theme.shadows.navigationControls};
    display: flex;
    flex-direction: column; // Stack buttons vertically
    gap: ${(props) => props.theme.spacing.xs};
`;

const NavButton = styled.button`
    background-color: transparent;
    border: none;
    border-radius: ${(props) => props.theme.borderRadius.medium};
    color: ${(props) => props.theme.colors.visNavButtonText};
    width: 38px;
    height: 38px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${(props) => props.theme.fonts.main};
    font-size: 20px; // Adjust for icon size
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: ${(props) => props.theme.colors.contentPrimary};
    }
    &:active {
        background-color: rgba(255, 255, 255, 0.15);
    }
    &:focus,
    &:focus-visible {
        outline: 2px solid ${(props) => props.theme.colors.accentBlue}66;
        outline-offset: 1px;
    }

    &:disabled {
        color: ${(props) =>
            props.theme.colors.contentTertiary}99; // Dim disabled state
        cursor: not-allowed;
        background-color: transparent;
    }
`;

// Simple SVG Icons (replace with more elaborate ones if desired)
const ZoomInIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line
            x1="12"
            y1="5"
            x2="12"
            y2="19"
        ></line>
        <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
        ></line>
    </svg>
);

const ZoomOutIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
        ></line>
    </svg>
);

const FitContentIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line
            x1="21"
            y1="3"
            x2="14"
            y2="10"
        ></line>
        <line
            x1="3"
            y1="21"
            x2="10"
            y2="14"
        ></line>
    </svg>
);

interface NavigationControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFit: () => void;
    isNetworkReady: boolean; // To disable buttons if network isn't ready
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
    onZoomIn,
    onZoomOut,
    onFit,
    isNetworkReady,
}) => {
    return (
        <ControlsContainer>
            <NavButton
                onClick={onZoomIn}
                aria-label="Zoom In"
                disabled={!isNetworkReady}
            >
                <ZoomInIcon />
            </NavButton>
            <NavButton
                onClick={onZoomOut}
                aria-label="Zoom Out"
                disabled={!isNetworkReady}
            >
                <ZoomOutIcon />
            </NavButton>
            <NavButton
                onClick={onFit}
                aria-label="Fit to Content"
                disabled={!isNetworkReady}
            >
                <FitContentIcon />
            </NavButton>
        </ControlsContainer>
    );
};

export default NavigationControls;
