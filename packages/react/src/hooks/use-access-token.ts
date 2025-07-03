import * as React from 'react';
import { useI18n } from './use-i18n';
import { useCoreClient } from './use-core-client';

/**
 * Result returned by the `useAccessToken` hook.
 */
interface UseAccessTokenResult {
  /**
   * Fetches an Auth0 access token.
   * @param ignoreCache - If true, bypasses the cache and forces a new token request.
   * @returns Promise that resolves with the access token.
   */
  getToken: (ignoreCache?: boolean) => Promise<string>;
}

/**
 * React hook to get Auth0 access tokens.
 */
export function useAccessToken(scope: string, audiencePath: string): UseAccessTokenResult {
  const t = useI18n('common');
  const { coreClient } = useCoreClient();

  if (!coreClient) {
    throw new Error(t('errors.core_client_not_initialized'));
  }

  const getToken = React.useCallback(
    async (ignoreCache = false): Promise<string> => {
      return coreClient.getToken(scope, audiencePath, ignoreCache);
    },
    [coreClient, scope, audiencePath],
  );

  return {
    getToken,
  };
}
