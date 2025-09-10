import type { StylingVariables } from '@auth0-web-ui-components/core';
import type React from 'react';

/**
 * Theme configuration
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
export interface ThemeSettings {
  theme?: 'default' | 'minimal' | 'rounded';
  mode?: 'light' | 'dark';
  variables?: StylingVariables;
}

/**
 * ThemeInput
 *
 * Optional props passed into the ThemeProvider.
 */
export type ThemeInput = {
  theme?: 'default' | 'minimal' | 'rounded';
  mode?: 'light' | 'dark';
  variables?: StylingVariables;
  loader?: React.ReactNode;
};

/**
 * ThemeContextValue
 *
 * The values made available through the ThemeContext.
 */
export type ThemeContextValue = {
  theme?: 'default' | 'minimal' | 'rounded';
  isDarkMode?: boolean;
  variables: StylingVariables;
  loader: React.ReactNode | null;
};
