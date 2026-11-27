'use client';

import { getStatusCode, isMfaStepUpError } from '@auth0/universal-components-core';
import { createContext, useContext } from 'react';

export interface GateKeeperContextValue {
  error: Error | null;
  /** Defined only when an error is active. */
  onRetry?: () => Promise<boolean>;
}

export const GateKeeperContext = createContext<GateKeeperContextValue | null>(null);

/**
 * @internal
 * @returns Current GateKeeper context value
 * @throws Error if used outside of the GateKeeperProvider
 */
export function useGateKeeperContext(): GateKeeperContextValue {
  const context = useContext(GateKeeperContext);

  if (!context) {
    throw new Error('useGateKeeperContext must be used within a GateKeeperProvider');
  }

  return context;
}

/**
 * @internal
 * @returns Whether a request failed on the server's side (5xx or 429), or an MFA step-up did not finish.
 */
export function useLoadFailed(): boolean {
  const { error } = useGateKeeperContext();
  const statusCode = getStatusCode(error);
  return (
    !!error &&
    (isMfaStepUpError(error) || (!!statusCode && (statusCode >= 500 || statusCode === 429)))
  );
}
