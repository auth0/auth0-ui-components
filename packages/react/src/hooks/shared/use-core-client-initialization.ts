/**
 * CoreClient initialization hook.
 * @module use-core-client-initialization
 * @internal
 */

import type {
  CoreClientInterface,
  AuthDetails,
  I18nInitOptions,
} from '@auth0/universal-components-core';
import { createCoreClient } from '@auth0/universal-components-core';
import * as React from 'react';

interface UseCoreClientInitializationProps {
  authDetails: AuthDetails;
  i18nOptions?: I18nInitOptions;
}

/**
 * @internal
 * @param props - Initialization props.
 * @returns The initialized CoreClient instance, or null while initializing.
 */
export const useCoreClientInitialization = ({
  authDetails,
  i18nOptions,
}: UseCoreClientInitializationProps): CoreClientInterface | null => {
  const { authProxyUrl } = authDetails;
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);

  React.useEffect(() => {
    const initializeCoreClient = async () => {
      try {
        const initializedCoreClient = await createCoreClient(authDetails, i18nOptions);
        setCoreClient(initializedCoreClient);
      } catch (error) {
        console.error(error);
      }
    };
    initializeCoreClient();
  }, [authProxyUrl, i18nOptions]);

  return coreClient;
};
