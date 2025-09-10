'use client';

import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { Auth0ComponentConfigContext } from '@/hooks/index';
import type { Auth0ComponentProviderProps } from '@/types/auth-types';

import { ProxyProvider } from './proxy-provider';
import { ThemeProvider } from './theme-provider';
const SpaProvider = React.lazy(() => import('./spa-provider'));

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
  const config = React.useMemo(
    () => ({
      themeSettings,
      customOverrides,
      loader,
    }),
    [themeSettings, customOverrides, loader],
  );

  return (
    <Auth0ComponentConfigContext.Provider value={{ config }}>
      <ThemeProvider theme={{ branding: themeSettings, customOverrides }}>
        <React.Suspense fallback={loader || <Spinner />}>
          {authDetails?.authProxyUrl ? (
            <ProxyProvider i18n={i18n} authDetails={authDetails}>
              {children}
            </ProxyProvider>
          ) : (
            <SpaProvider i18n={i18n} authDetails={authDetails}>
              {children}
            </SpaProvider>
          )}
        </React.Suspense>
      </ThemeProvider>
    </Auth0ComponentConfigContext.Provider>
  );
};
