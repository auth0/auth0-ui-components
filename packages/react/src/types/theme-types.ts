import React from 'react';
import type { Styling } from '@auth0-web-ui-components/core';

/**
 * Theme configuration
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
export interface ThemeSettings {
  mode?: 'light' | 'dark';
  styleOverrides?: Styling;
}

/**
 * ThemeInput
 *
 * Optional props passed into the ThemeProvider.
 */
export type ThemeInput = {
  mode?: 'light' | 'dark';
  styleOverrides?: Styling;
  loader?: React.ReactNode;
};

/**
 * ThemeContextValue
 *
 * The values made available through the ThemeContext.
 */
export type ThemeContextValue = {
  isDarkMode?: boolean;
  styleOverrides: Styling;
  loader: React.ReactNode | null;
};
