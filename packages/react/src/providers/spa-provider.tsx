'use client';

import { useAuth0 } from '@auth0/auth0-react';
import * as React from 'react';

import { CoreClientContext } from '@/hooks/use-core-client';
import { useCoreClientInitialization } from '@/hooks/use-core-client-initialization';
import type { InternalProviderProps } from '@/types/auth-types';

export const SpaProvider = ({
  i18n,
  authDetails,
  children,
}: InternalProviderProps & { children: React.ReactNode }) => {
  const auth0ContextInterface = useAuth0();

  const coreClient = useCoreClientInitialization({
    authDetails: {
      ...authDetails,
      contextInterface: auth0ContextInterface,
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

export default SpaProvider;
