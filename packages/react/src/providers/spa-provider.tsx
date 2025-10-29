'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type { BasicAuth0ContextInterface } from '@auth0-web-ui-components/core';
import * as React from 'react';

import { CoreClientContext } from '../hooks/use-core-client';
import { useCoreClientInitialization } from '../hooks/use-core-client-initialization';
import type { InternalProviderProps } from '../types/auth-types';

import { ScopeManagerProvider } from './scope-manager-provider';

export const SpaProvider = ({
  i18n,
  authDetails,
  children,
}: InternalProviderProps & { children: React.ReactNode }) => {
  let auth0ContextInterface: BasicAuth0ContextInterface = useAuth0();
  // Check if user is using auth0-react SDK
  if (!auth0ContextInterface) {
    // Check if user is passing the auth0-spa-js SDK
    if (authDetails?.contextInterface) {
      auth0ContextInterface = authDetails.contextInterface;
    } else {
      throw new Error(
        'Auth0ContextInterface is not available. Make sure you use auth0-react-sdk or auth0-spa-js and you are passing the client to the SDK',
      );
    }
  }

  const memoizedAuthDetails = React.useMemo(
    () => ({
      ...authDetails,
      contextInterface: auth0ContextInterface,
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

export default SpaProvider;
