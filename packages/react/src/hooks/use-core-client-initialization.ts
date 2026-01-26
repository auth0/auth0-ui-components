import type {
  CoreClientInterface,
  AuthDetails,
  I18nInitOptions,
  CustomFetch,
} from '@auth0/universal-components-core';
import { createCoreClient } from '@auth0/universal-components-core';
import * as React from 'react';

interface UseCoreClientInitializationProps {
  authDetails: AuthDetails;
  i18nOptions?: I18nInitOptions;
  customFetch?: CustomFetch;
}

/**
 * Custom hook to handle CoreClient initialization
 */
export const useCoreClientInitialization = ({
  authDetails,
  i18nOptions,
  customFetch,
}: UseCoreClientInitializationProps) => {
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);
  const { domain, authProxyUrl } = authDetails;

  React.useEffect(() => {
    const initializeCoreClient = async () => {
      try {
        const initializedCoreClient = await createCoreClient(authDetails, i18nOptions, customFetch);
        setCoreClient(initializedCoreClient);
      } catch (error) {
        console.error(error);
      }
    };
    initializeCoreClient();
  }, [domain, authProxyUrl, i18nOptions]);

  return coreClient;
};
