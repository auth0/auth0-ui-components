'use client';

import * as React from 'react';
import type { Auth0ComponentProviderProps } from '@/types/auth-types';
import { Spinner } from '@/components/ui/spinner';
import { ThemeProvider } from './theme-provider';
import { ProxyProvider } from './proxy-provider';
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
 * @param {Object} [props.theme] - Theme settings including mode and style overrides.
 * @param {string} [props.theme.mode] - Theme mode, either "light" or "dark". Defaults to "light".
 * @param {Object} [props.theme.styleOverrides] - CSS variable overrides for customizing the theme.
 * @param {Object} [props.theme.styleOverrides.common] - CSS variables common to all themes.
 * @param {Object} [props.theme.styleOverrides.light] - CSS variables specific to light mode.
 * @param {Object} [props.theme.styleOverrides.dark] - CSS variables specific to dark mode.
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
 *   theme={{
 *     mode: "dark",
 *     styleOverrides: {
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
  theme = {
    mode: 'light',
    styleOverrides: {
      common: {},
      light: {},
      dark: {},
    },
  },
  loader,
  children,
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={{ mode: theme.mode, styleOverrides: theme.styleOverrides, loader }}>
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
  );
};
