/**
 * SPA provider using @auth0/auth0-react.
 * @module spa-provider
 */

'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type { AuthDetails } from '@auth0/universal-components-core';
import * as React from 'react';

import { Toaster } from '@/components/auth0/shared/sonner';
import { Spinner } from '@/components/ui/spinner';
import { CoreClientContext } from '@/hooks/shared/use-core-client';
import { useCoreClientInitialization } from '@/hooks/shared/use-core-client-initialization';
import { useToastProvider } from '@/hooks/shared/use-toast-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ScopeManagerProvider } from '@/providers/scope-manager-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import type { Auth0ComponentProviderProps } from '@/types/auth-types';

/**
 * Auth0 provider for SPAs. Wraps components with required contexts.
 * @param props - Provider configuration including domain, mode, authContext, i18n, themeSettings, toastSettings, cacheConfig, loader, and children.
 * @returns Provider component tree
 */
export const Auth0ComponentProvider = (
  props: Auth0ComponentProviderProps & { children: React.ReactNode },
) => {
  const {
    i18n,
    domain,
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
    mode,
    children,
  } = props;
  const authContext = mode !== 'proxy' ? props.authContext : undefined;
  const mergedToastSettings = useToastProvider(toastSettings);

  const auth0ReactContext = useAuth0();

  const resolvedAuthContext = React.useMemo(() => {
    if (authContext) {
      return authContext;
    }
    if (auth0ReactContext && 'isAuthenticated' in auth0ReactContext) {
      // Cast via unknown because @auth0/auth0-react's Auth0ContextInterface
      // doesn't include getConfiguration which our BasicAuth0ContextInterface requires
      return auth0ReactContext as unknown as AuthDetails['contextInterface'];
    }

    throw new Error(
      'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react, or pass authContext.',
    );
  }, [auth0ReactContext, authContext]);

  const memoizedAuthDetails = React.useMemo<AuthDetails>(
    () => ({
      domain,
      contextInterface: resolvedAuthContext,
      previewMode,
    }),
    [domain, resolvedAuthContext, previewMode],
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
        />
      )}
      <React.Suspense
        fallback={
          loader || (
            <div className="flex items-center justify-center min-h-[200px]">
              <Spinner />
            </div>
          )
        }
      >
        <CoreClientContext.Provider value={coreClientValue}>
          <QueryProvider cacheConfig={cacheConfig}>
            <ScopeManagerProvider>{children}</ScopeManagerProvider>
          </QueryProvider>
        </CoreClientContext.Provider>
      </React.Suspense>
    </ThemeProvider>
  );
};

export default Auth0ComponentProvider;
