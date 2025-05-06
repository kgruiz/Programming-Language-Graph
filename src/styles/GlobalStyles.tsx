import { Global, css } from '@emotion/react';
import theme from './theme'; // Adjust path if necessary

const GlobalStyles = () => (
    <Global
        styles={css`
            html,
            body {
                margin: 0;
                padding: 0;
                height: 100%;
                font-family: ${theme.fonts.main};
                overflow: hidden;
                background-color: ${theme.colors.background};
                color: ${theme.colors.text};
                display: flex;
                flex-direction: column;
            }

            body > div:first-of-type,
            body > div:first-of-type > div {
                // For Next.js wrapper
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            * {
                box-sizing: border-box;
            }

            /* Vis Network Customizations */
            .vis-navigation .vis-button {
                background-color: ${theme.colors.visNavButtonBackground};
                border: 1px solid ${theme.colors.visNavButtonBorder};
                border-radius: 8px;
                box-shadow: ${theme.shadows.control};
                color: ${theme.colors.visNavButtonText};
                font-size: 18px;
                width: 32px;
                height: 32px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.15s ease-in-out;
            }
            .vis-navigation .vis-button:hover {
                background-color: ${theme.colors.visNavButtonHoverBackground};
            }
            .vis-navigation {
                position: absolute;
                bottom: 20px;
                left: 20px;
                z-index: 5;
            }
            .vis-zoomExtends {
                display: none !important; /* Original style was display: none */
            }

            /* For custom select arrow */
            select {
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='${encodeURIComponent(
                    theme.colors.labelLight
                )}' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right 0.7em top 50%;
                background-size: 0.65em auto;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                padding-right: 2.5em; /* Space for arrow */
            }
        `}
    />
);

export default GlobalStyles;
