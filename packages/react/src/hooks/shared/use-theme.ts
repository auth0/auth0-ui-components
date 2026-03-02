/**
 * Theme context hook.
 * @module use-theme
 */

'use client';

import { useContext } from 'react';

import { ThemeContext } from '@/providers/theme-provider';

/**
 * Hook to access theme context (mode, variables, loader).
 * @returns Theme context value.
 * @throws If used outside ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
