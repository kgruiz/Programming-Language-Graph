const theme = {
    colors: {
        background: '#1c1c1e', // Apple Dark Mode Background
        text: '#f5f5f7',
        controlBackground: '#363638',
        controlBorder: '#48484a',
        controlText: '#f5f5f7',
        controlHoverBackground: '#464649',
        controlHoverBorder: '#5a5a5e',
        labelLight: '#a0a0a5',
        separator: '#3a3a3c',
        controlsContainerBackground: '#2c2c2e',
        highlightGood: '#30d158', // Brighter Apple Green
        highlightGoodBorder: '#28a745',
        highlightBad: '#ff453a', // Brighter Apple Red
        highlightBadBorder: '#d9362f',
        resetButtonBackground: '#0a84ff', // Apple Blue
        resetButtonBorder: '#0060df',
        resetButtonHoverBackground: '#0073e6',
        sidebarBackground: 'rgba(44, 44, 46, 0.88)',
        sidebarBorder: 'rgba(120, 120, 120, 0.4)',
        sidebarText: '#f5f5f7',
        sidebarHeader: '#fff',
        sidebarSubheader: '#c0c0c5',
        sidebarListItem: '#d2d2d7',
        codeBackground: 'rgba(20, 20, 22, 0.75)',
        codeBorder: 'rgba(80, 80, 80, 0.5)',
        codeText: '#e0e0e0',
        dimmedNodeBackground: 'rgba(30, 30, 32, 0.7)',
        dimmedNodeBorder: 'rgba(60, 60, 62, 0.7)',
        dimmedNodeText: '#757575',
        visNavButtonBackground: '#363638',
        visNavButtonBorder: '#48484a',
        visNavButtonText: '#e0e0e0',
        visNavButtonHoverBackground: '#464649',
    },
    fonts: {
        main: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        mono: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
    },
    shadows: {
        control: '0 1px 1px rgba(0, 0, 0, 0.15)',
        controlsContainer: '0 1px 3px rgba(0, 0, 0, 0.2)',
        sidebar: '0 10px 30px rgba(0, 0, 0, 0.35)',
    },
};

export type AppTheme = typeof theme;

export default theme;
