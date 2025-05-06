// src/emotion.d.ts
import '@emotion/react';
import { AppTheme } from './styles/theme'; // Adjust path if your theme.ts is elsewhere

declare module '@emotion/react' {
    export interface Theme extends AppTheme {}
}
