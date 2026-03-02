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
 * @returns CoreClient instance or null.
 * @throws If used outside Auth0ComponentProvider.
 */
export const useCoreClient = () => {
  const context = React.useContext(CoreClientContext);
  if (!context) {
    throw new Error('useCoreClient must be used within Auth0ComponentProvider');
  }
  return context;
};

export { CoreClientContext };
