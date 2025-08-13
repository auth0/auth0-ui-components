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
  styling: defaultStyleOverrides,
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
 *     styling: {
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
  const { styling, loader, mode, theme } = React.useMemo(
    () => ({
      styling: themeSettings?.styling ?? defaultStyleOverrides,
      loader: themeSettings?.loader ?? null,
      mode: themeSettings?.mode,
      theme: themeSettings?.theme,
    }),
    [themeSettings],
  );

  React.useEffect(() => {
    applyStyleOverrides(styling, mode, theme);
  }, [styling, mode, theme]);

  return (
    <ThemeContext.Provider value={{ isDarkMode: mode === 'dark', styling, loader }}>
      {children}
    </ThemeContext.Provider>
  );
};
