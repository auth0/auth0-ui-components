'use client';

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
 * Auth0 Proxy Provider for Next.js and server-side authentication
 *
 * Use this when you have a backend proxy that handles Auth0 authentication.
 *
 * @example
 * ```tsx
 * <Auth0ProxyProvider
 *   authDetails={{ authProxyUrl: '/api/auth' }}
 *   themeSettings={{ mode: 'dark', theme: 'rounded' }}
 *   toastSettings={{ provider: 'custom', customMethods: {...} }}
 * >
 *   <YourApp />
 * </Auth0ProxyProvider>
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

  const memoizedAuthDetails = React.useMemo(
    () => ({
      ...authDetails,
      contextInterface: undefined,
    }),
    [authDetails],
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
