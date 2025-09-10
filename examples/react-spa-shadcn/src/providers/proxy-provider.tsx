'use client';

import * as React from 'react';

import { CoreClientContext } from '@/hooks/use-core-client';
import { useCoreClientInitialization } from '@/hooks/use-core-client-initialization';
import type { InternalProviderProps } from '@/types/auth-types';

export const ProxyProvider = ({
  i18n,
  authDetails,
  children,
}: InternalProviderProps & { children: React.ReactNode }) => {
  const coreClient = useCoreClientInitialization({
    authDetails: {
      ...authDetails,
      contextInterface: undefined,
    },
    i18nOptions: i18n,
  });

  const coreClientValue = React.useMemo(
    () => ({
      coreClient,
    }),
    [coreClient],
  );

  return (
    <CoreClientContext.Provider value={coreClientValue}>{children}</CoreClientContext.Provider>
  );
};

export default ProxyProvider;
