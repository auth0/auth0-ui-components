'use client';

import * as React from 'react';

import { CoreClientContext } from '../hooks/use-core-client';
import { useCoreClientInitialization } from '../hooks/use-core-client-initialization';
import type { InternalProviderProps } from '../types/auth-types';

import { ScopeManagerProvider } from './scope-manager-provider';

export const ProxyProvider = ({
  i18n,
  authDetails,
  children,
}: InternalProviderProps & { children: React.ReactNode }) => {
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
    <CoreClientContext.Provider value={coreClientValue}>
      <ScopeManagerProvider>{children}</ScopeManagerProvider>
    </CoreClientContext.Provider>
  );
};

export default ProxyProvider;
