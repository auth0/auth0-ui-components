'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type { AuthDetails } from '@auth0/universal-components-core';
import * as React from 'react';

import { Toaster } from '../components/ui/sonner';
import { Spinner } from '../components/ui/spinner';
import { CoreClientContext } from '../hooks/use-core-client';
import { useCoreClientInitialization } from '../hooks/use-core-client-initialization';
import type { Auth0ComponentProviderProps } from '../types/auth-types';

import { ScopeManagerProvider } from './scope-manager-provider';
import { ThemeProvider } from './theme-provider';

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
    loader,
    children,
  } = props;
  const authContext = props.mode !== 'proxy' ? props.authContext : undefined;

  const auth0ReactContext = useAuth0();

  const resolvedAuthContext = React.useMemo(() => {
    if (authContext) {
      return authContext;
    }

    if (auth0ReactContext && 'isAuthenticated' in auth0ReactContext) {
      return auth0ReactContext as unknown as AuthDetails['contextInterface'];
    }

    throw new Error(
      'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react, or pass authContext.',
    );
  }, [auth0ReactContext, authContext]);

  const memoizedAuthDetails = React.useMemo(
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
      <Toaster position="top-right" />
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
          <ScopeManagerProvider>{children}</ScopeManagerProvider>
        </CoreClientContext.Provider>
      </React.Suspense>
    </ThemeProvider>
  );
};

export default Auth0ComponentProvider;
