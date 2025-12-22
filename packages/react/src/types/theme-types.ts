import type { StylingVariables } from '@auth0/universal-components-core';
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
 * BrandingTheme
 *
 * Controlled UL branding configuration.
 */
export type BrandingTheme = {
  mode?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  [key: string]: unknown;
};

/**
 * CustomerOverrides
 *
 * Custom CSS variable overrides (e.g. "--button-radius": "6px").
 */
export type CustomOverrides = Record<string, string>;

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
