'use client';

import * as React from 'react';
import type { Auth0ComponentConfig } from './types';
import { Auth0ComponentContext } from './context';
import { ThemeProvider } from './theme-provider';

/**
 * ProxyModeProvider
 *
 * Provides Auth0 configuration and theming when using proxy mode,
 * where authentication is handled externally (e.g., server-side or via a proxy).
 *
 * This component sets up the context with proxy mode enabled and supplies
 * the proxy URL as the API base URL. It also applies theming via the ThemeProvider.
 *
 * @param children - React children components that require Auth0 context and theming
 * @param i18n - Internationalization settings including current and fallback languages (default: English US)
 * @param themeSettings - Theme and branding settings, e.g., mode (default: light)
 * @param customOverrides - Optional CSS variable overrides for custom styling
 * @param authProxyUrl - URL of the authentication proxy handling Auth0 auth flows externally
 *
 * @example
 * ```tsx
 * <ProxyModeProvider
 *   authProxyUrl="/api/auth"
 *   i18n={{ currentLanguage: 'en', fallbackLanguage: 'en' }}
 *   themeSettings={{ mode: 'dark' }}
 *   customOverrides={{ '--font-size': '16px' }}
 * >
 *   <App />
 * </ProxyModeProvider>
 * ```
 */
export function ProxyModeProvider({
  children,
  i18n = { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  themeSettings = { mode: 'light' },
  customOverrides = {},
  authProxyUrl = '',
}: Auth0ComponentConfig & { children: React.ReactNode; authProxyUrl?: string }) {
  const config = React.useMemo(
    () => ({
      i18n,
      themeSettings,
      customOverrides,
      isProxyMode: true,
      apiBaseUrl: authProxyUrl,
    }),
    [i18n, themeSettings, customOverrides, authProxyUrl],
  );

  return (
    <Auth0ComponentContext.Provider value={{ config }}>
      <ThemeProvider theme={{ branding: themeSettings, customOverrides }}>{children}</ThemeProvider>
    </Auth0ComponentContext.Provider>
  );
}
