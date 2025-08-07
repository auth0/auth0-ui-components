'use client';

import * as React from 'react';
import { applyStyleOverrides, type Styling } from '@auth0-web-ui-components/core';
import type { ThemeContextValue, ThemeInput } from '@/types/theme-types';

/**
 * Default empty customer overrides. (later may be UL branding)
 */
const defaultStyleOverrides: Styling = { common: {}, light: {}, dark: {} };

/**
 * ThemeContext
 *
 * Provides access to customer overrides and a merged theme object for convenience.
 */
export const ThemeContext = React.createContext<ThemeContextValue>({
  isDarkMode: false,
  styleOverrides: defaultStyleOverrides,
  loader: null,
});

/**
 * ThemeProvider
 *
 * Provides theme configuration via React Context to all components in the tree.
 * It merges optional customer overrides (CSS variables).
 *
 * @param theme - Optional customerOverrides
 * @param children - The components that will have access to the theme
 *
 * @example
 * ```tsx
 * <ThemeProvider
 *   theme={{
 *     mode: 'dark',
 *     styleOverrides: {
 *       common: {
 *         "--font-size-heading": "1.5rem",
 *         "--font-size-title": "1.25rem",
 *       },
 *       light: {
 *         "--color-primary": "blue",
 *       },
 *       dark: {
 *         "--color-primary": "red",
 *       },
 *     },
 *     loader: <CustomSpinner />
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
  const styleOverrides = React.useMemo(
    () => theme?.styleOverrides ?? defaultStyleOverrides,
    [theme?.styleOverrides],
  );

  const loader = React.useMemo(() => theme?.loader ?? null, [theme?.loader]);

  React.useEffect(() => {
    applyStyleOverrides(styleOverrides, theme?.mode);
  }, [styleOverrides, theme?.mode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode: theme?.mode === 'dark', styleOverrides, loader }}>
      {children}
    </ThemeContext.Provider>
  );
};
