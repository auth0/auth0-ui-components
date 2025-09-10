import type {
  CoreClientInterface,
  AuthDetailsCore,
  I18nInitOptions,
} from '@auth0-web-ui-components/core';
import { createCoreClient } from '@auth0-web-ui-components/core';
import * as React from 'react';

interface UseCoreClientInitializationProps {
  authDetails: AuthDetailsCore;
  i18nOptions?: I18nInitOptions;
}

/**
 * Custom hook to handle CoreClient initialization
 */
export const useCoreClientInitialization = ({
  authDetails,
  i18nOptions,
}: UseCoreClientInitializationProps) => {
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);

  React.useEffect(() => {
    const initializeCoreClient = async () => {
      try {
        const initializedCoreClient = await createCoreClient(authDetails, i18nOptions);

        setCoreClient(initializedCoreClient);
      } catch (error) {
        console.error('Failed to initialize CoreClient:', error);
        setCoreClient(null);
      }
    };

    initializeCoreClient();
  }, [
    authDetails.contextInterface?.getAccessTokenSilently,
    i18nOptions?.currentLanguage,
    i18nOptions?.fallbackLanguage,
  ]);

  return coreClient;
};
