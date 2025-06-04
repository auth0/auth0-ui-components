'use client';

import * as React from 'react';
import type { Auth0ComponentConfig } from './types';
import { ProxyModeProvider } from './proxy-mode-provider';

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
  ...props
}: Auth0ComponentConfig & { children: React.ReactNode }) => {
  const isProxyMode = Boolean(authProxyUrl);

  if (isProxyMode) {
    return <ProxyModeProvider {...props} authProxyUrl={authProxyUrl} />;
  }

  return (
    <React.Suspense fallback={null}>
      <SpaModeProvider {...props} />
    </React.Suspense>
  );
};
