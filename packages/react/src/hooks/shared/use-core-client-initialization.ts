/**
 * CoreClient initialization hook.
 * @module use-core-client-initialization
 * @internal
 */

import type {
  CoreClientInterface,
  AuthDetails,
  I18nInitOptions,
  TelemetryConfig,
} from '@auth0/universal-components-core';
import { createCoreClient } from '@auth0/universal-components-core';
import * as React from 'react';

interface UseCoreClientInitializationProps {
  authDetails: AuthDetails;
  i18nOptions?: I18nInitOptions;
  telemetry: TelemetryConfig;
}

/**
 * @internal
 * @param props - Initialization props.
 * @returns The initialized CoreClient instance, or null while initializing.
 */
export const useCoreClientInitialization = ({
  authDetails,
  i18nOptions,
  telemetry,
}: UseCoreClientInitializationProps): CoreClientInterface | null => {
  const { authProxyUrl } = authDetails;
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);

  // Extract primitive values from telemetry to avoid re-runs on object reference changes
  const { css, distribution, framework } = telemetry;

  React.useEffect(() => {
    // Wait for CSS detection to complete before initializing
    if (css === 'unknown') {
      return;
    }

    const initializeCoreClient = async () => {
      try {
        const initializedCoreClient = await createCoreClient(authDetails, i18nOptions, {
          css,
          distribution,
          framework,
        });
        setCoreClient(initializedCoreClient);
      } catch (error) {
        console.error(error);
      }
    };
    initializeCoreClient();
  }, [authProxyUrl, i18nOptions, css, distribution, framework]);

  return coreClient;
};
