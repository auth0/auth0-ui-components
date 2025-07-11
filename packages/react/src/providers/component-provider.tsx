'use client';

import * as React from 'react';
import type { Auth0ComponentProviderProps } from './types';
import { CoreClientContext } from '@/hooks/use-core-client';
import { Spinner } from '@/components/ui/spinner';
import { useCoreClientInitialization } from '@/hooks/use-core-client-initialization';
import { AuthDetailsCore } from '@auth0-web-ui-components/core';
import { Auth0ComponentConfigContext } from '@/hooks';
import { ThemeProvider } from './theme-provider';

/**
 * Auth0ComponentProvider
 *
 * The main Auth0 context provider component that conditionally
 * renders either the Proxy Mode or SPA Mode provider based on the presence
 * of `authProxyUrl`.
 *
 * - **Proxy Mode:** Used when authentication is handled externally via a proxy server.
 * - **SPA Mode:** Used when authentication is handled client-side using the Auth0 SPA SDK.
 *
 * This component abstracts the complexity of choosing the correct mode from the end user.
 *
 * @param {Object} props - Configuration props.
 * @param {React.ReactNode} props.children - Child components that require authentication context.
 * @param {Object} [props.i18n] - Internationalization configuration (language, fallback).
 * @param {Object} [props.themeSettings] - Theme and branding settings.
 * @param {Object} [props.customOverrides] - Optional CSS variable overrides for styling.
 * @param {React.ReactNode} [props.loader] - Custom loading component to show while
 *                                                    authentication is initializing.
 *                                                    Defaults to "Loading authentication...".
 *
 * @returns {JSX.Element} The provider component for Auth0 context.
 *
 * @example
 * ```tsx
 * <Auth0ComponentProvider
 *   authProxyUrl="/api/auth"
 *   i18n={{ currentLanguage: 'en', fallbackLanguage: 'en' }}
 *   themeSettings={{ mode: 'dark' }}
 * >
 *   <App />
 * </Auth0ComponentProvider>
 * ```
 */
export const Auth0ComponentProvider = ({
  i18n,
  authDetails,
  themeSettings = { mode: 'light' },
  customOverrides = {},
  loader,
  children,
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
  // const isProxyMode = Boolean(authDetails.authProxyUrl); TODO:

  // Add default values if not provided
  const authDetailsCore: AuthDetailsCore = {
    clientId: authDetails.clientId,
    domain: authDetails.domain,
    accessToken: authDetails.accessToken ?? undefined,
    scopes: authDetails.scopes ?? undefined,
    authProxyUrl: authDetails.authProxyUrl ?? undefined,
    contextInterface: authDetails.contextInterface,
  };

  const coreClient = useCoreClientInitialization({
    authDetails: authDetailsCore,
    i18nOptions: i18n,
  });

  const config = React.useMemo(
    () => ({
      themeSettings,
      customOverrides,
      loader,
    }),
    [themeSettings, customOverrides, loader],
  );

  const coreClientValue = React.useMemo(
    () => ({
      coreClient,
    }),
    [coreClient],
  );

  return (
    <CoreClientContext.Provider value={coreClientValue}>
      <Auth0ComponentConfigContext.Provider value={{ config }}>
        <ThemeProvider theme={{ branding: themeSettings, customOverrides }}>
          {/* <I18nContext.Provider value={i18nValue}> */}
          <React.Suspense fallback={loader || <Spinner />}>{children}</React.Suspense>
          {/* </I18nContext.Provider> */}
        </ThemeProvider>
      </Auth0ComponentConfigContext.Provider>
    </CoreClientContext.Provider>
  );
};
