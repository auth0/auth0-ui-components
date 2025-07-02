'use client';

import * as React from 'react';
import type { Auth0ComponentProviderProps } from './types';
import { ProxyModeProvider } from './proxy-mode-provider';
import type { TFactory, CoreClientInterface } from '@auth0-web-ui-components/core';
import { createI18n, CoreClient } from '@auth0-web-ui-components/core';
import { I18nContext } from './i18n-provider';
import { CoreClientContext } from '@/hooks/use-core-client';
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
  ...props
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
  const isProxyMode = Boolean(authProxyUrl);
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);
  const [i18nState, setI18nState] = React.useState<{
    initialized: boolean;
    translator: TFactory | undefined;
  }>({
    initialized: false,
    translator: undefined,
  });

  // Initialize i18n first
  React.useEffect(() => {
    if (!i18n?.currentLanguage) {
      setI18nState({ initialized: true, translator: undefined });
      return;
    }

    const initializeTranslations = async () => {
      try {
        const instance = await createI18n({
          currentLanguage: i18n.currentLanguage,
          fallbackLanguage: i18n.fallbackLanguage,
        });

        setI18nState({
          initialized: true,
          translator: instance.t,
        });
      } catch {
        setI18nState({
          initialized: true,
          translator: undefined,
        });
      }
    };

    initializeTranslations();
  }, [i18n?.currentLanguage, i18n?.fallbackLanguage]);

  // Initialize CoreClient after i18n is ready
  React.useEffect(() => {
    if (!i18nState.initialized) {
      return;
    }

    const initializeCoreClient = async () => {
      try {
        const initializedCoreClient = await CoreClient.create(
          props.authDetails,
          i18nState.translator,
        );

        setCoreClient(initializedCoreClient);
      } catch (error) {
        console.error('Failed to initialize CoreClient:', error);
        setCoreClient(null);
      }
    };

    initializeCoreClient();
  }, [
    i18nState.initialized,
    i18nState.translator,
    props.authDetails.contextInterface?.getAccessTokenSilently,
    props.authDetails.contextInterface?.getIdTokenClaims,
  ]);

  const i18nValue = React.useMemo(
    () => ({
      translator: i18nState.translator,
      initialized: i18nState.initialized,
    }),
    [i18nState.translator, i18nState.initialized],
  );

  const coreClientValue = React.useMemo(
    () => ({
      coreClient,
    }),
    [coreClient],
  );

  return (
    <CoreClientContext.Provider value={coreClientValue}>
      <I18nContext.Provider value={i18nValue}>
        {isProxyMode ? (
          <ProxyModeProvider {...props} authProxyUrl={authProxyUrl} />
        ) : (
          <React.Suspense fallback={props.loader || <Spinner />}>
            <SpaModeProvider {...props} />
          </React.Suspense>
        )}
      </I18nContext.Provider>
    </CoreClientContext.Provider>
  );
};
