/**
 * RWA proxy provider for server-side auth.
 * @module proxy-provider
 */

'use client';

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
 * Auth0 provider for RWAs using backend proxy auth.
 * @param props - Provider configuration including i18n, authDetails, themeSettings, toastSettings, cacheConfig, loader, and children.
 * @returns Provider component tree
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
  cacheConfig,
  loader,
  children,
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
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
