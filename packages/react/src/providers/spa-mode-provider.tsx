'use client';

import * as React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Auth0ComponentConfig, AuthDetails } from './types';
import { Auth0ComponentContext } from './context';
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
  i18n = { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  themeSettings = { mode: 'light' },
  customOverrides = {},
}: Auth0ComponentConfig & { children: React.ReactNode }) {
  const { getIdTokenClaims, getAccessTokenSilently } = useAuth0();

  const [authDetails, setAuthDetails] = React.useState<AuthDetails>({
    accessToken: undefined,
    domain: undefined,
    clientId: undefined,
    scopes: undefined,
    loading: true,
    error: undefined,
  });

  React.useEffect(() => {
    const fetchAuth = async () => {
      try {
        const tokenRes = await getAccessTokenSilently({
          cacheMode: 'off',
          detailedResponse: true,
        });
        const claims = await getIdTokenClaims();

        setAuthDetails({
          accessToken: tokenRes.access_token,
          domain: claims?.iss,
          clientId: claims?.aud,
          scopes: tokenRes.scope,
          loading: false,
          error: undefined,
        });
      } catch (err) {
        setAuthDetails({
          accessToken: undefined,
          domain: undefined,
          clientId: undefined,
          scopes: undefined,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    };

    fetchAuth();
  }, [getIdTokenClaims, getAccessTokenSilently]);

  const apiBaseUrl = authDetails.domain ?? '';

  const config = React.useMemo(
    () => ({
      i18n,
      themeSettings,
      customOverrides,
      isProxyMode: false,
      apiBaseUrl,
      authDetails,
    }),
    [i18n, themeSettings, customOverrides, apiBaseUrl, authDetails],
  );

  return (
    <Auth0ComponentContext.Provider value={{ config }}>
      <ThemeProvider theme={{ branding: themeSettings, customOverrides }}>{children}</ThemeProvider>
    </Auth0ComponentContext.Provider>
  );
}

export default SpaModeProvider;
