const theme = {
    colors: {
        // Core Palette (Dark Mode Apple-like)
        backgroundPrimary: '#1D1D1F', // Main background
        backgroundSecondary: '#2C2C2E', // Controls container, card-like elements
        backgroundTertiary: '#3A3A3C', // Subtle divisions, hover states

        contentPrimary: '#F5F5F7', // Main text
        contentSecondary: '#E0E0E0', // Slightly dimmer text
        contentTertiary: '#A0A0A5', // Labels, placeholder text, inactive icons

        separator: '#38383A', // Borders, dividers

        // Accents
        accentBlue: '#0A84FF',
        accentBlueHover: '#007AFF',
        accentBlueActive: '#0060DF',

        accentGreen: '#30D158', // Success, "Good"
        accentGreenHover: '#28B54A',
        accentGreenBorder: '#28A745',

        accentRed: '#FF453A', // Error, "Bad"
        accentRedHover: '#FF3B30',
        accentRedBorder: '#D9362F',

        // Controls
        controlBackground: '#363638',
        controlBorder: '#4A4A4C',
        controlText: '#F5F5F7',
        controlHoverBackground: '#454547',
        controlHoverBorder: '#58585C',
        controlFocusBorder: '#0A84FF', // Blue outline on focus

        // Sidebar (Frosted Glass)
        sidebarBackground: 'rgba(44, 44, 46, 0.85)', // Semi-transparent dark grey
        sidebarBorder: 'rgba(120, 120, 120, 0.3)', // Faint border
        sidebarHeader: '#FFFFFF',
        sidebarSubheader: '#D1D1D6',
        sidebarListItem: '#E5E5EA',

        // Code Block
        codeBackground: 'rgba(28, 28, 30, 0.8)',
        codeBorder: 'rgba(70, 70, 70, 0.5)',
        codeText: '#E0E0E0',

        // Graph Nodes (General)
        nodeBackground: '#3A3A3C',
        nodeBorder: '#555558',
        nodeText: '#F5F5F7',
        nodeShadow: 'rgba(0, 0, 0, 0.3)',

        // Dimmed States
        dimmedNodeBackground: 'rgba(30, 30, 32, 0.7)',
        dimmedNodeBorder: 'rgba(50, 50, 52, 0.7)',
        dimmedNodeText: '#8E8E93', // Apple's secondary label color

        // Vis.js Navigation Buttons
        visNavButtonBackground: '#363638',
        visNavButtonBorder: '#4A4A4C',
        visNavButtonText: '#E0E0E0',
        visNavButtonHoverBackground: '#454547',
    },
    fonts: {
        main: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        mono: "'SF Mono', 'Menlo', 'Monaco', Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    shadows: {
        control: '0 1px 2px rgba(0, 0, 0, 0.2)',
        controlsContainer: '0 2px 4px rgba(0, 0, 0, 0.25)',
        sidebar:
            '0 12px 38px rgba(0, 0, 0, 0.30), 0 0 12px rgba(0, 0, 0, 0.22)',
        node: '0 2px 5px rgba(0,0,0,0.25)',
    },
    borderRadius: {
        small: '6px',
        medium: '10px', // Standard Apple corner radius
        large: '14px',
    },
    spacing: {
        xs: '4px',
        s: '8px',
        m: '16px',
        l: '24px',
        xl: '32px',
    },
};

export type AppTheme = typeof theme;

export default theme;
