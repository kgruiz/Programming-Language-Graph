import React from 'react';
import GlobalStyles from '@/styles/GlobalStyles';
import { ThemeProvider } from '@emotion/react';
import theme from '@/styles/theme';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {children}
        </ThemeProvider>
    );
};

export default Layout;
