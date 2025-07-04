'use client';

import * as React from 'react';
import type { Auth0ComponentContextType, Auth0ComponentConfig, AuthDetails } from './types';
import { initializeI18n } from '@auth0-web-ui-components/core';
import { Auth0ComponentContext } from './context';
import { ThemeProvider } from './theme-provider';
import { Spinner } from '@/components/ui/spinner';

const SpaModeProvider = React.lazy(() => import('./spa-mode-provider'));

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
 * @param {string} [props.authProxyUrl] - Optional URL for proxy mode. When provided,
 *                                       enables proxy mode; otherwise, SPA mode is used.
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
  authProxyUrl,
  i18n,
  themeSettings = { mode: 'light' },
  customOverrides = {},
  loader,
  children,
}: Auth0ComponentConfig & { children: React.ReactNode }) => {
  const isProxyMode = Boolean(authProxyUrl);
  const [authDetails, setAuthDetails] = React.useState<AuthDetails | undefined>(undefined);
  const [apiBaseUrl, setApiBaseUrl] = React.useState<string | undefined>(authProxyUrl);
  const [isI18nInitialized, setIsI18nInitialized] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState<string | undefined>(
    i18n?.currentLanguage,
  );

  // Initialize i18n when language changes
  React.useEffect(() => {
    const initI18n = async () => {
      setIsI18nInitialized(false); // Reset initialization state
      await initializeI18n({
        currentLanguage: i18n?.currentLanguage,
        fallbackLanguage: i18n?.fallbackLanguage,
      });
      setCurrentLanguage(i18n?.currentLanguage);
      setIsI18nInitialized(true);
    };

    initI18n();
  }, [i18n?.currentLanguage, i18n?.fallbackLanguage]);

  const contextValue = React.useMemo<Auth0ComponentContextType>(
    () => ({
      authProxyUrl,
      i18nConfig: i18n,
      themeSettings,
      customOverrides,
      loader,

      // Mode-specific properties
      isProxyMode,
      apiBaseUrl: apiBaseUrl || (isProxyMode && authProxyUrl ? authProxyUrl : undefined),
      authDetails,
    }),
    [
      authProxyUrl,
      i18n,
      themeSettings,
      customOverrides,
      loader,
      isProxyMode,
      apiBaseUrl,
      authDetails,
      isI18nInitialized,
      currentLanguage,
    ],
  );

  return (
    <Auth0ComponentContext.Provider value={contextValue}>
      <ThemeProvider theme={{ branding: themeSettings, customOverrides }}>
        {isProxyMode ? (
          children
        ) : (
          <React.Suspense fallback={loader || <Spinner />}>
            <SpaModeProvider setAuthDetails={setAuthDetails} setApiBaseUrl={setApiBaseUrl}>
              {children}
            </SpaModeProvider>
          </React.Suspense>
        )}
      </ThemeProvider>
    </Auth0ComponentContext.Provider>
  );
};
