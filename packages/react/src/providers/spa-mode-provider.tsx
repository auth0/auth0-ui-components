'use client';

import * as React from 'react';
import type { Auth0ComponentConfig } from './types';
import { Auth0ComponentConfigContext } from '../hooks/use-config';
import { ThemeProvider } from './theme-provider';

/**
 * SpaModeProvider
 *
 * Provides Auth0 authentication details and theming for Single Page Applications (SPA) mode,
 * where Auth0 is integrated directly via the `@auth0/auth0-react` SDK.
 *
 * This component fetches the user's authentication details such as access token, domain,
 * client ID, and scopes by calling Auth0 SDK hooks. It manages authentication state internally
 * and updates the context accordingly.
 *
 * It also wraps children with a ThemeProvider to apply branding and custom style overrides.
 *
 * @param children - React children components that require Auth0 context and theming
 * @param i18n - Internationalization settings including current and fallback languages (default: English US)
 * @param themeSettings - Theme and branding settings, e.g., mode (default: light)
 * @param customOverrides - Optional CSS variable overrides for custom styling
 *
 * @example
 * ```tsx
 * <SpaModeProvider
 *   i18n={{ currentLanguage: 'en', fallbackLanguage: 'en' }}
 *   themeSettings={{ mode: 'dark' }}
 *   customOverrides={{ '--font-size': '16px' }}
 * >
 *   <App />
 * </SpaModeProvider>
 * ```
 */
function SpaModeProvider({
  children,
  themeSettings = { mode: 'light' },
  customOverrides = {},
  loader,
}: Auth0ComponentConfig & { children: React.ReactNode }) {
  const config = React.useMemo(
    () => ({
      themeSettings,
      customOverrides,
      isProxyMode: false,
      loader,
    }),
    [themeSettings, customOverrides, loader],
  );
  // TODO: Should we move this to component-provider?

  return (
    <Auth0ComponentConfigContext.Provider value={{ config }}>
      <ThemeProvider theme={{ branding: themeSettings, customOverrides }}>{children}</ThemeProvider>
    </Auth0ComponentConfigContext.Provider>
  );
}

export default SpaModeProvider;
