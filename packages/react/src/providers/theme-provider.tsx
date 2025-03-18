'use client';

import * as React from 'react';
import { mergeThemes } from '@/lib/utils';
import type { BrandingTheme, CustomOverrides, ThemeContextValue, ThemeInput } from './types';

/**
 * Default branding theme if none is provided.
 */
const defaultBranding: BrandingTheme = {
  mode: 'light',
};

/**
 * Default empty customer overrides.
 */
const defaultCustomOverrides: CustomOverrides = {};

/**
 * ThemeContext
 *
 * Provides access to branding theme, customer overrides,
 * and a merged theme object for convenience.
 */
export const ThemeContext = React.createContext<ThemeContextValue>({
  branding: defaultBranding,
  customOverrides: defaultCustomOverrides,
  mergedTheme: mergeThemes(defaultBranding, defaultCustomOverrides),
});

/**
 * ThemeProvider
 *
 * Provides theme configuration via React Context to all components in the tree.
 * It merges a branding theme (from UL) and optional customer overrides (CSS variables).
 *
 * @param theme - Optional branding and customerOverrides
 * @param children - The components that will have access to the theme
 *
 * @example
 * ```tsx
 * <ThemeProvider
 *   theme={{
 *     branding: { mode: 'dark', primaryColor: '#0070f3' },
 *     customerOverrides: { '--font-size': '14px' }
 *   }}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<{
  theme?: ThemeInput;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  const branding = React.useMemo(() => theme?.branding ?? defaultBranding, [theme?.branding]);
  const customOverrides = React.useMemo(
    () => theme?.customOverrides ?? defaultCustomOverrides,
    [theme?.customOverrides],
  );

  const mergedTheme = React.useMemo(
    () => mergeThemes(branding, customOverrides),
    [branding, customOverrides],
  );

  return (
    <ThemeContext.Provider value={{ branding, customOverrides, mergedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
