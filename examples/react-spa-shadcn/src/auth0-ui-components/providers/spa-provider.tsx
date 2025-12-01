'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type { BasicAuth0ContextInterface } from '@auth0/web-ui-components-core';
import * as React from 'react';

import { Toaster } from '../components/ui/sonner';
import { Spinner } from '../components/ui/spinner';
import { CoreClientContext } from '../hooks/use-core-client';
import { useCoreClientInitialization } from '../hooks/use-core-client-initialization';
import type { Auth0ComponentProviderProps } from '../types/auth-types';

import { ScopeManagerProvider } from './scope-manager-provider';
import { ThemeProvider } from './theme-provider';

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
  const auth0ReactContext = useAuth0();

  const auth0ContextInterface = React.useMemo(() => {
    if (auth0ReactContext && 'isAuthenticated' in auth0ReactContext) {
      return auth0ReactContext as BasicAuth0ContextInterface;
    }

    if (authDetails?.contextInterface) {
      return authDetails.contextInterface;
    }

    throw new Error(
      'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react, or pass a contextInterface via authDetails.',
    );
  }, [auth0ReactContext, authDetails?.contextInterface]);

  const memoizedAuthDetails = React.useMemo(
    () => ({
      ...authDetails,
      contextInterface: auth0ContextInterface,
    }),
    [authDetails, auth0ContextInterface],
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
