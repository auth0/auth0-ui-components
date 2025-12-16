'use client';

import { useContext } from 'react';

import { ThemeContext } from '../providers/component-provider';

/**
 * useTheme
 *
 * Access the current theme from context. Includes:
 * - mode
 * - styling (CSS variables)
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
