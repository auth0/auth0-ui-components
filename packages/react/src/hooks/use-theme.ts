'use client';

import type { StylingVariables } from '@auth0/universal-components-core';
import { createContext, useContext } from 'react';

import type { ThemeContextValue } from '../types/theme-types';

const DEFAULT_STYLE_OVERRIDES: StylingVariables = { common: {}, light: {}, dark: {} };

export const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: false,
  variables: DEFAULT_STYLE_OVERRIDES,
  loader: null,
});

/**
 * useTheme
 *
 * Access the current theme from context. Includes:
 * - mode
 * - styling (CSS variables)
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
