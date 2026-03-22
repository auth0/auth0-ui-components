'use client';

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
