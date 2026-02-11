'use client';

import { applyStyleOverrides, type StylingVariables } from '@auth0/universal-components-core';
import * as React from 'react';

import type { ThemeContextValue, ThemeInput } from '../types/theme-types';

/**
 * Default empty customer overrides. (later may be UL branding)
 */
const defaultStyleOverrides: StylingVariables = { common: {}, light: {}, dark: {} };

/**
 * ThemeContext
 *
 * Provides access to customer overrides and a merged theme object for convenience.
 */
export const ThemeContext = React.createContext<ThemeContextValue>({
  isDarkMode: false,
  variables: defaultStyleOverrides,
  loader: null,
});

/**
 * ThemeProvider
 *
 * Provides theme configuration via React Context to all components in the tree.
 * It merges optional styling overrides (CSS variables).
 *
 * @param themeSettings - Optional styling overrides
 * @param children - The components that will have access to the theme
 *
 * @example
 * ```tsx
 * <ThemeProvider
 *   themeSettings={{
 *     theme: "default" | "minimal" | "rounded";
 *     mode: 'dark',
 *     variables: {
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
  themeSettings?: ThemeInput;
  children: React.ReactNode;
}> = ({ themeSettings, children }) => {
  const { variables, loader, mode, theme } = React.useMemo(
    () => ({
      variables: themeSettings?.variables ?? defaultStyleOverrides,
      loader: themeSettings?.loader ?? null,
      mode: themeSettings?.mode,
      theme: themeSettings?.theme,
    }),
    [themeSettings],
  );

  React.useEffect(() => {
    applyStyleOverrides(variables, mode, theme);
  }, [variables, mode, theme]);

  return (
    <ThemeContext.Provider value={{ isDarkMode: mode === 'dark', variables, loader }}>
      <div className="auth0">{children}</div>
    </ThemeContext.Provider>
  );
};
