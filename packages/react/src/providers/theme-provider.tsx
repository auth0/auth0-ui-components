/**
 * Theme provider for styling configuration.
 * @module theme-provider
 * @internal
 */

'use client';

import { applyStyleOverrides, type StylingVariables } from '@auth0/universal-components-core';
import * as React from 'react';

import type { ThemeContextValue, ThemeInput } from '@/types/theme-types';

/** Default empty style overrides. */
const defaultStyleOverrides: StylingVariables = { common: {}, light: {}, dark: {} };

/**
 * Theme context for accessing theme settings.
 * @internal
 * @returns The context provider component
 */
export const ThemeContext = React.createContext<ThemeContextValue>({
  isDarkMode: false,
  variables: defaultStyleOverrides,
  loader: null,
});

/**
 * Provides theme configuration to the component tree.
 * @param props - Component props.
 * @param props.themeSettings - Theme settings with mode, variables, and loader.
 * @param props.children - Child components.
 * @returns Theme provider.
 * @internal
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
      {children}
    </ThemeContext.Provider>
  );
};
