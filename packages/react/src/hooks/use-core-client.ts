import * as React from 'react';
import type { CoreClientInterface } from '@auth0-web-ui-components/core';

const CoreClientContext = React.createContext<{
  coreClient: CoreClientInterface | null;
}>({
  coreClient: null,
});

/**
 * Hook to access the CoreClient instance from context.
 *
 * Provides access to the initialized CoreClient which handles API calls and business logic.
 *
 * @returns {{ coreClient: CoreClientInterface | null }} The current CoreClient instance or null if not initialized.
 *
 * @throws {Error} Throws if used outside of an Auth0ComponentProvider.
 */
export const useCoreClient = () => {
  const context = React.useContext(CoreClientContext);
  if (!context) {
    throw new Error('useCoreClient must be used within Auth0ComponentProvider');
  }
  return context;
};

export { CoreClientContext };
