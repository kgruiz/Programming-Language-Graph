import { Global, css } from '@emotion/react';
import theme from './theme';

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
                background-color: ${theme.colors.backgroundPrimary};
                color: ${theme.colors.contentPrimary};
                display: flex;
                flex-direction: column;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            body > div:first-of-type,
            body > div:first-of-type > div {
                /* For Next.js wrapper */
                height: 100%;
                display: flex;
                flex-direction: column;
                flex: 1;
            }

            * {
                box-sizing: border-box;
            }

            /* Custom select arrow */
            select {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='${encodeURIComponent(
                    theme.colors.contentTertiary
                )}' class='bi bi-chevron-expand' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right ${theme.spacing.s} center;
                background-size: 0.9em auto;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                padding-right: calc(
                    ${theme.spacing.s} + 1em + ${theme.spacing.m}
                );
            }

            /* Scrollbar styling (WebKit) */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: ${theme.colors.backgroundTertiary};
                border-radius: ${theme.borderRadius.large};
            }
            ::-webkit-scrollbar-thumb:hover {
                background: ${theme.colors.contentTertiary};
            }
            /* For Firefox */
            html {
                scrollbar-width: thin;
                scrollbar-color: ${theme.colors.backgroundTertiary} transparent;
            }

            /* Vis.js specific CSS for network canvas - can be kept if needed */
            .vis-network {
                /* outline: none; */ /* If you want to remove the default blue outline on canvas focus */
            }
        `}
    />
);

export default GlobalStyles;
