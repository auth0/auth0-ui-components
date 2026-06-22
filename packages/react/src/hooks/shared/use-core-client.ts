/**
 * CoreClient context and hook.
 * @module use-core-client
 */

import type { CoreClientInterface } from '@auth0/universal-components-core';
import * as React from 'react';

/** @internal */
const CoreClientContext = React.createContext<{
  coreClient: CoreClientInterface | null;
  activeComponent: { current: string };
}>({
  coreClient: null,
  activeComponent: { current: 'unknown' },
});

/**
 * Hook to access CoreClient from context.
 * @param component - Component name for telemetry tracking. Pass in service hooks to attribute API calls.
 * @returns CoreClient instance or null.
 * @throws If used outside Auth0ComponentProvider.
 */
export const useCoreClient = (component?: string) => {
  const context = React.useContext(CoreClientContext);
  if (!context) {
    throw new Error('useCoreClient must be used within Auth0ComponentProvider');
  }

  const { coreClient: rawClient, activeComponent } = context;

  // Intercept the two API getters to stamp activeComponent.current synchronously
  // before the underlying client is returned. This ensures the telemetry fetcher
  // reads the correct component name on every request, regardless of render order.
  const coreClient = React.useMemo((): CoreClientInterface | null => {
    if (!component || !rawClient) return rawClient;
    return {
      ...rawClient,
      getMyAccountApiClient: () => {
        activeComponent.current = component;
        return rawClient.getMyAccountApiClient();
      },
      getMyOrganizationApiClient: () => {
        activeComponent.current = component;
        return rawClient.getMyOrganizationApiClient();
      },
    };
  }, [component, rawClient]);

  return { coreClient };
};

export { CoreClientContext };
