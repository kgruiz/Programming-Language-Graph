import React from 'react';
import styled from '@emotion/styled';
import type { CategoryShortToFullName as CategoryShortToFullNameType } from '@/types';

const IconWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: ${(props) => props.theme.spacing.s};
    vertical-align: -0.1em;
    svg {
        width: 100%;
        height: 100%;
    }
`;

const ThumbUpIcon = () => (
    <IconWrapper>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                d="M0 0h24v24H0V0z"
                fill="none"
            />
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
        </svg>
    </IconWrapper>
);

const ThumbDownIcon = () => (
    <IconWrapper>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                d="M0 0h24v24H0V0z"
                fill="none"
            />
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79-.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
        </svg>
    </IconWrapper>
);

const ResetIcon = () => (
    <IconWrapper>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                d="M0 0h24v24H0z"
                fill="none"
            />
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
        </svg>
    </IconWrapper>
);

interface ControlsProps {
    categories: string[];
    categoryMap: CategoryShortToFullNameType;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onHighlightGood: () => void;
    onHighlightBad: () => void;
    onResetHighlights: () => void;
    activeHighlightType?: 'good' | 'bad';
}

const ControlsContainer = styled.div`
    padding: ${(props) => props.theme.spacing.m};
    background-color: ${(props) =>
        props.theme.colors.backgroundSecondary}E6; // 90% opacity
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    border-bottom: 1px solid ${(props) => props.theme.colors.separator};
    display: flex;
    flex-wrap: wrap;
    gap: ${(props) => props.theme.spacing.m};
    align-items: center;
    box-shadow: ${(props) => props.theme.shadows.controlsContainer};
    min-height: 75px;
    position: relative; /* For z-indexing if needed */
    z-index: 20; /* Ensure it's above the graph but below modals if any */
`;

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${(props) => props.theme.spacing.s};
`;

const ControlLabel = styled.label`
    font-size: 14px;
    color: ${(props) => props.theme.colors.contentTertiary};
    margin-right: ${(props) => props.theme.spacing.xs};
`;

const Select = styled.select`
    padding: ${(props) => props.theme.spacing.s}
        ${(props) => props.theme.spacing.m};
    border-radius: ${(props) => props.theme.borderRadius.medium};
    border: 1px solid ${(props) => props.theme.colors.controlBorder};
    background-color: ${(props) => props.theme.colors.controlBackground};
    color: ${(props) => props.theme.colors.controlText};
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    transition: background-color 0.2s ease, border-color 0.2s ease,
        box-shadow 0.2s ease;
    box-shadow: ${(props) => props.theme.shadows.control};
    min-width: 200px;

    &:hover {
        background-color: ${(props) =>
            props.theme.colors.controlHoverBackground};
        border-color: ${(props) => props.theme.colors.controlHoverBorder};
    }
    &:focus,
    &:focus-visible {
        outline: none;
        border-color: ${(props) => props.theme.colors.accentBlue};
        box-shadow: ${(props) => props.theme.shadows.control},
            0 0 0 3px ${(props) => props.theme.colors.accentBlue}4D;
    }
`;

interface ButtonElementProps {
    isActiveGood?: boolean;
    isActiveBad?: boolean;
    isReset?: boolean;
}

const Button = styled.button<ButtonElementProps>`
    padding: ${(props) => props.theme.spacing.s}
        ${(props) => props.theme.spacing.m};
    border-radius: ${(props) => props.theme.borderRadius.medium};
    border: 1px solid transparent; /* Start with transparent for active states */
    background-color: ${(props) => props.theme.colors.controlBackground};
    color: ${(props) => props.theme.colors.controlText};
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1.2;
    transition: background-color 0.2s ease, border-color 0.2s ease,
        box-shadow 0.2s ease, color 0.2s ease;
    box-shadow: ${(props) => props.theme.shadows.control};

    &:hover {
        background-color: ${(props) =>
            props.theme.colors.controlHoverBackground};
    }
    &:active {
        background-color: ${(props) => props.theme.colors.backgroundTertiary};
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    &:focus,
    &:focus-visible {
        outline: none;
        border-color: ${(props) => props.theme.colors.accentBlue};
        box-shadow: ${(props) => props.theme.shadows.control},
            0 0 0 3px ${(props) => props.theme.colors.accentBlue}4D;
    }

    ${(props) => (props.isActiveGood || props.isActiveBad) && ` color: #fff; `}

    ${(props) =>
        props.isActiveGood &&
        `
        background-color: ${props.theme.colors.accentGreen};
        border-color: ${props.theme.colors.accentGreen};
        &:hover {
            background-color: ${props.theme.colors.accentGreenHover};
            border-color: ${props.theme.colors.accentGreenHover};
        }
        &:focus, &:focus-visible {
            border-color: ${props.theme.colors.accentGreen};
            box-shadow: 0 0 0 3px ${props.theme.colors.accentGreen}4D;
        }
    `}

    ${(props) =>
        props.isActiveBad &&
        `
        background-color: ${props.theme.colors.accentRed};
        border-color: ${props.theme.colors.accentRed};
        &:hover {
            background-color: ${props.theme.colors.accentRedHover};
            border-color: ${props.theme.colors.accentRedHover};
        }
        &:focus, &:focus-visible {
            border-color: ${props.theme.colors.accentRed};
            box-shadow: 0 0 0 3px ${props.theme.colors.accentRed}4D;
        }
    `}

    ${(props) =>
        props.isReset && // For Reset button
        `
        background-color: ${props.theme.colors.controlBackground};
        border: 1px solid ${props.theme.colors.controlBorder};
        &:hover {
            background-color: ${props.theme.colors.controlHoverBackground};
            border-color: ${props.theme.colors.controlHoverBorder};
        }
    `}
`;

const Controls: React.FC<ControlsProps> = ({
    categories,
    categoryMap,
    selectedCategory,
    onCategoryChange,
    onHighlightGood,
    onHighlightBad,
    onResetHighlights,
    activeHighlightType,
}) => {
    return (
        <ControlsContainer>
            <ControlGroup>
                <ControlLabel htmlFor="categorySelect">Category:</ControlLabel>
                <Select
                    id="categorySelect"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    {categories.map((catShort: string) => (
                        <option
                            key={catShort}
                            value={catShort}
                        >
                            {categoryMap[catShort] || catShort}
                        </option>
                    ))}
                </Select>
            </ControlGroup>

            <ControlGroup>
                <ControlLabel>Highlight:</ControlLabel>
                <Button
                    onClick={onHighlightGood}
                    isActiveGood={activeHighlightType === 'good'}
                    aria-pressed={activeHighlightType === 'good'}
                >
                    <ThumbUpIcon /> Good At
                </Button>
                <Button
                    onClick={onHighlightBad}
                    isActiveBad={activeHighlightType === 'bad'}
                    aria-pressed={activeHighlightType === 'bad'}
                >
                    <ThumbDownIcon /> Bad At
                </Button>
                <Button
                    onClick={onResetHighlights}
                    isReset
                    aria-label="Reset highlights"
                >
                    <ResetIcon /> Reset
                </Button>
            </ControlGroup>
        </ControlsContainer>
    );
};

export default Controls;
