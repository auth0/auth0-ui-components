import React from 'react';

/**
 * Theme configuration
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
export interface ThemeSettings {
  mode?: 'light' | 'dark';
  ulBrandingOverrides?: StyleOverrides;
}

/**
 * CustomerOverrides
 *
 * Custom CSS variable overrides (e.g. "--button-radius": "6px").
 */
export type StyleOverrides = Record<string, string>;

/**
 * ThemeInput
 *
 * Optional props passed into the ThemeProvider.
 */
export type ThemeInput = {
  mode?: 'light' | 'dark';
  ulBrandingOverrides?: StyleOverrides;
  loader?: React.ReactNode;
};

/**
 * ThemeContextValue
 *
 * The values made available through the ThemeContext.
 */
export type ThemeContextValue = {
  ulBrandingOverrides: StyleOverrides;
  loader: React.ReactNode | null;
};
