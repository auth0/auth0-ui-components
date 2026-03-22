/**
 * SPA provider using @auth0/auth0-react.
 * @module spa-provider
 */

'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type { AuthDetails, BasicAuth0ContextInterface } from '@auth0/universal-components-core';
import * as React from 'react';

import { Toaster } from '@/components/auth0/shared/sonner';
import { Spinner } from '@/components/ui/spinner';
import { CoreClientContext } from '@/hooks/shared/use-core-client';
import { useCoreClientInitialization } from '@/hooks/shared/use-core-client-initialization';
import { useToastProvider } from '@/hooks/shared/use-toast-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import type { Auth0ComponentProviderProps } from '@/types/auth-types';

/**
 * Auth0 provider for SPAs. Wraps components with required contexts.
 * @param props - Provider configuration including domain, mode, authContext, i18n, themeSettings, toastSettings, cacheConfig, loader, and children.
 * @returns Provider component tree
 */
export const Auth0ComponentProvider = (
  props: Extract<Auth0ComponentProviderProps, { mode?: 'direct' }> & { children: React.ReactNode },
) => {
  const {
    i18n,
    previewMode,
    themeSettings = {
      theme: 'default',
      mode: 'light',
      variables: {
        common: {},
        light: {},
        dark: {},
      },
    },
    toastSettings,
    cacheConfig,
    loader,
    children,
    authContext,
  } = props;
  const mergedToastSettings = useToastProvider(toastSettings);

  const auth0ReactContext = useAuth0();

  const resolvedAuthContext = React.useMemo(() => {
    if (authContext) {
      return authContext;
    }
    if (auth0ReactContext && 'isAuthenticated' in auth0ReactContext) {
      return auth0ReactContext as BasicAuth0ContextInterface;
    }

    throw new Error(
      'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react, or pass authContext.',
    );
  }, [auth0ReactContext, authContext]);

  const memoizedAuthDetails = React.useMemo<AuthDetails>(
    () => ({
      contextInterface: resolvedAuthContext,
      previewMode,
    }),
    [resolvedAuthContext, previewMode],
  );

  const coreClient = useCoreClientInitialization({
    authDetails: memoizedAuthDetails,
    i18nOptions: i18n,
  });

  const coreClientValue = React.useMemo(
    () => ({
      coreClient,
    }),
    [coreClient],
  );

  const fallback = loader || (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner />
    </div>
  );

  return (
    <ThemeProvider
      themeSettings={{
        mode: themeSettings.mode,
        variables: themeSettings.variables,
        loader,
        theme: themeSettings.theme,
      }}
    >
      {mergedToastSettings.provider === 'sonner' && (
        <Toaster
          position={mergedToastSettings.settings?.position || 'top-right'}
          closeButton={mergedToastSettings.settings?.closeButton ?? true}
          className="auth0-universal"
        />
      )}
      {coreClient ? (
        <CoreClientContext.Provider value={coreClientValue}>
          <QueryProvider cacheConfig={cacheConfig}>{children}</QueryProvider>
        </CoreClientContext.Provider>
      ) : (
        fallback
      )}
    </ThemeProvider>
  );
};

export default Auth0ComponentProvider;
