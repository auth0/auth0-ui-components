'use client';

import * as React from 'react';

import { Toaster } from '../components/ui/sonner';
import { Spinner } from '../components/ui/spinner';
import type { Auth0ComponentProviderProps } from '../types/auth-types';

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
 * @param {Object} [props.i18n] - Internationalization configuration (e.g., current language, fallback language).
 * @param {Object} [props.themeSettings] - Theme settings including mode, theme and style overrides.
 * @param {string} [props.themeSettings.mode] - Theme mode, either "light" or "dark". Defaults to "light".
 * @param {string} [props.themeSettings.theme] - Theme , either "default", minimal or "rounded". Defaults to "default".
 * @param {Object} [props.themeSettings.variables] - CSS variable overrides for customizing the theme.
 * @param {React.ReactNode} [props.loader] - Custom loading component to show while
 *                                           authentication is initializing.
 *                                           Defaults to a spinner.
 * @param {Object} [props.authDetails] - Authentication details, including `authProxyUrl`.
 *
 * @returns {JSX.Element} The provider component for Auth0 context.
 *
 * @example
 * ```tsx
 * <Auth0ComponentProvider
 *   authDetails={{ authProxyUrl: "/api/auth" }}
 *   i18n={{ currentLanguage: "en", fallbackLanguage: "en" }}
 *   themeSettings={{
 *     theme: 'default
 *     mode: "dark",
 *     variables: {
 *         common: {
 *           "--font-size-heading": "1.5rem",
 *           "--font-size-title": "1.25rem",
 *         },
 *         light: {
 *           "--color-primary": "blue",
 *         },
 *         dark: {
 *           "--color-primary": "red",
 *         },
 *       }
 *   }}
 *  loader={<div>Loading...</div>}
 * >
 *   <App />
 * </Auth0ComponentProvider>
 * ```
 */
export const Auth0ComponentProvider = ({
  i18n,
  authDetails,
  themeSettings = {
    theme: 'default',
    mode: 'light',
    variables: {
      common: {},
      light: {},
      dark: {},
    },
  },
  loader,
  children,
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
  return (
    <>
      <Toaster position="top-right" />
      <ThemeProvider
        themeSettings={{
          mode: themeSettings.mode,
          variables: themeSettings.variables,
          loader,
          theme: themeSettings.theme,
        }}
      >
        <React.Suspense
          fallback={
            loader || (
              <div className="flex items-center justify-center min-h-[200px]">
                <Spinner />
              </div>
            )
          }
        >
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
    </>
  );
};
