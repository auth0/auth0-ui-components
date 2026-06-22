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
  activeComponent: { current: string };
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
  activeComponent,
}: UseCoreClientInitializationProps): CoreClientInterface | null => {
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);

  React.useEffect(() => {
    if (telemetry.enabled && telemetry.css === 'unknown') return;

    const initializeCoreClient = async () => {
      try {
        const initializedCoreClient = await createCoreClient(
          authDetails,
          i18nOptions,
          telemetry,
          activeComponent,
        );
        setCoreClient(initializedCoreClient);
      } catch (error) {
        console.error(error);
      }
    };
    initializeCoreClient();
  }, [authDetails.authProxyUrl, i18nOptions, telemetry]);

  return coreClient;
};
