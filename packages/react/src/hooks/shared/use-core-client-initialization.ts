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
 * Initializes CoreClient with auth and i18n config.
 * @param props - Hook props.
 * @param props.authDetails - Auth0 authentication details.
 * @param props.i18nOptions - i18n configuration options.
 * @returns The initialized CoreClient instance
 * @internal
 */
export const useCoreClientInitialization = ({
  authDetails,
  i18nOptions,
}: UseCoreClientInitializationProps) => {
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);
  const { authProxyUrl } = authDetails;

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
