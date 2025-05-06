import React from 'react';
import styled from '@emotion/styled';
import { categoriesOrder as defaultCategoriesOrder } from '@/data'; // Data for categoriesOrder
import type { CategoryShortToFullName as CategoryShortToFullNameType } from '@/types'; // Type definition

interface ControlsProps {
    categories: string[]; // This is typeof defaultCategoriesOrder from @/data
    categoryMap: CategoryShortToFullNameType; // This is the data object from @/data, conforming to the type from @/types
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onHighlightGood: () => void;
    onHighlightBad: () => void;
    onResetHighlights: () => void;
    activeHighlightType?: 'good' | 'bad';
}

const ControlsContainer = styled.div`
    padding: 12px 20px;
    background-color: ${(props) =>
        props.theme.colors.controlsContainerBackground};
    border-bottom: 1px solid ${(props) => props.theme.colors.separator};
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    box-shadow: ${(props) => props.theme.shadows.controlsContainer};
`;

const ControlLabel = styled.label`
    font-size: 14px;
    color: ${(props) => props.theme.colors.labelLight};
    margin-right: -4px; /* Pull closer to select */
`;

const Select = styled.select`
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.colors.controlBorder};
    background-color: ${(props) => props.theme.colors.controlBackground};
    color: ${(props) => props.theme.colors.controlText};
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.15s ease, border-color 0.15s ease,
        box-shadow 0.15s ease;
    box-shadow: ${(props) => props.theme.shadows.control};
    min-width: 180px;

    &:hover {
        background-color: ${(props) =>
            props.theme.colors.controlHoverBackground};
        border-color: ${(props) => props.theme.colors.controlHoverBorder};
    }
`;

// Props passed directly to the Button component in JSX
interface ButtonElementProps {
    isActiveGood?: boolean;
    isActiveBad?: boolean;
    isReset?: boolean;
}

const Button = styled.button<ButtonElementProps>`
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.colors.controlBorder};
    background-color: ${(props) => props.theme.colors.controlBackground};
    color: ${(props) => props.theme.colors.controlText};
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.15s ease, border-color 0.15s ease,
        box-shadow 0.15s ease;
    box-shadow: ${(props) => props.theme.shadows.control};

    &:hover {
        background-color: ${(props) =>
            props.theme.colors.controlHoverBackground};
        border-color: ${(props) => props.theme.colors.controlHoverBorder};
    }
    &:active {
        background-color: #2a2a2c; /* Slightly darker for active state */
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    ${(props) =>
        (props.isActiveGood || props.isActiveBad) &&
        `
        color: white;
        font-weight: 500;
    `}

    ${(props) =>
        props.isActiveGood &&
        `
        background-color: ${props.theme.colors.highlightGood};
        border-color: ${props.theme.colors.highlightGoodBorder};
        box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 0 0 2px ${props.theme.colors.highlightGood}66; /* 40% opacity */
    `}

    ${(props) =>
        props.isActiveBad &&
        `
        background-color: ${props.theme.colors.highlightBad};
        border-color: ${props.theme.colors.highlightBadBorder};
        box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 0 0 2px ${props.theme.colors.highlightBad}66; /* 40% opacity */
    `}

    ${(props) =>
        props.isReset &&
        `
        background-color: ${props.theme.colors.resetButtonBackground};
        color: white;
        border-color: ${props.theme.colors.resetButtonBorder};
        &:hover {
            background-color: ${props.theme.colors.resetButtonHoverBackground};
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
            <ControlLabel htmlFor="categorySelect">
                Highlight Category:
            </ControlLabel>
            <Select
                id="categorySelect"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
            >
                {categories.map(
                    (
                        catShort: string // Added type for catShort
                    ) => (
                        <option
                            key={catShort}
                            value={catShort}
                        >
                            {categoryMap[catShort] || catShort}
                        </option>
                    )
                )}
            </Select>
            <Button
                onClick={onHighlightGood}
                isActiveGood={activeHighlightType === 'good'}
            >
                👍 Good In
            </Button>
            <Button
                onClick={onHighlightBad}
                isActiveBad={activeHighlightType === 'bad'}
            >
                👎 Bad In
            </Button>
            <Button
                onClick={onResetHighlights}
                isReset
            >
                Reset All
            </Button>
        </ControlsContainer>
    );
};

export default Controls;
