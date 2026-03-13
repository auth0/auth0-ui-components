/**
 * CoreClient context and hook.
 * @module use-core-client
 */

import type { CoreClientInterface } from '@auth0/universal-components-core';
import * as React from 'react';

/** @internal */
const CoreClientContext = React.createContext<{
  coreClient: CoreClientInterface | null;
}>({
  coreClient: null,
});

/**
 * Hook to access CoreClient from context.
 * @returns CoreClient instance or null, plus pre-resolved API clients.
 * @throws If used outside Auth0ComponentProvider.
 */
export const useCoreClient = (): {
  coreClient: CoreClientInterface | null;
  myAccountClient: NonNullable<CoreClientInterface['myAccountApiClient']> | null;
  myOrganizationClient: NonNullable<CoreClientInterface['myOrganizationApiClient']> | null;
} => {
  const context = React.useContext(CoreClientContext);
  if (!context) {
    throw new Error('useCoreClient must be used within Auth0ComponentProvider');
  }
  return {
    ...context,
    myAccountClient: context.coreClient?.myAccountApiClient ?? null,
    myOrganizationClient: context.coreClient?.myOrganizationApiClient ?? null,
  };
};

export { CoreClientContext };
