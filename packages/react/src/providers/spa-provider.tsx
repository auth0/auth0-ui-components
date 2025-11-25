'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type { BasicAuth0ContextInterface } from '@auth0/web-ui-components-core';
import * as React from 'react';

import { Toaster } from '../components/ui/sonner';
import { Spinner } from '../components/ui/spinner';
import { CoreClientContext } from '../hooks/use-core-client';
import { useCoreClientInitialization } from '../hooks/use-core-client-initialization';
import { useToastProvider } from '../hooks/use-toast-provider';
import type { Auth0ComponentProviderProps } from '../types/auth-types';

import { ScopeManagerProvider } from './scope-manager-provider';
import { ThemeProvider } from './theme-provider';

/**
 * Auth0 SPA Provider for client-side authentication
 *
 * Use this when using @auth0/auth0-react for client-side authentication.
 * Must be nested inside Auth0Provider from @auth0/auth0-react.
 *
 * @example
 * ```tsx
 * import { Auth0Provider } from '@auth0/auth0-react';
 *
 * <Auth0Provider domain="..." clientId="..." redirectUri="...">
 *   <Auth0SpaProvider
 *     authDetails={authDetails}
 *     themeSettings={{ mode: 'dark', theme: 'rounded' }}
 *     toastSettings={{ provider: 'custom', customMethods: {...} }}
 *   >
 *     <YourApp />
 *   </Auth0SpaProvider>
 * </Auth0Provider>
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
  toastSettings,
  loader,
  children,
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
  // Use custom hook to handle toast configuration
  const mergedToastSettings = useToastProvider(toastSettings);

  let auth0ContextInterface: BasicAuth0ContextInterface = useAuth0();

  // Check if user is using auth0-react SDK
  if (!auth0ContextInterface) {
    // Check if user is passing the auth0-spa-js SDK
    if (authDetails?.contextInterface) {
      auth0ContextInterface = authDetails.contextInterface;
    } else {
      throw new Error(
        'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react',
      );
    }
  }

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
      {/* Render Toaster only for Sonner provider */}
      {mergedToastSettings.provider === 'sonner' && (
        <Toaster position={mergedToastSettings.position} />
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
          <ScopeManagerProvider>{children}</ScopeManagerProvider>
        </CoreClientContext.Provider>
      </React.Suspense>
    </ThemeProvider>
  );
};

export default Auth0ComponentProvider;
