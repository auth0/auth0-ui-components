'use client';

import { useContext } from 'react';

import { ThemeContext } from '@/providers/theme-provider';

/**
 * useTheme
 *
 * Access the current theme from context. Includes:
 * - branding (UL theme)
 * - customerOverrides (CSS variables)
 * - mergedTheme (computed result)
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
