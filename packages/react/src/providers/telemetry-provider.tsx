/**
 * Telemetry provider for tracking which block component initiated API calls.
 * @module telemetry-provider
 * @internal
 */

import * as React from 'react';

interface TelemetryContextValue {
  componentRef: { current: string };
}

export const TelemetryContext = React.createContext<TelemetryContextValue | null>(null);

interface TelemetryProviderProps {
  children: React.ReactNode;
  componentRef: { current: string };
}

/**
 * Provider that wraps the component tree to enable telemetry tracking.
 * @param props - Provider props
 * @param props.children - Child components
 * @param props.componentRef - Ref to track current component name
 * @returns Provider component with telemetry context
 * @internal
 */
export function TelemetryProvider({ children, componentRef }: TelemetryProviderProps) {
  const value = React.useMemo(() => ({ componentRef }), [componentRef]);
  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

/**
 * Hook to access the telemetry context.
 * @returns The telemetry context value
 * @throws Error if used outside of Auth0ComponentProvider
 * @internal
 */
export function useTelemetryContext() {
  const context = React.useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within Auth0ComponentProvider');
  }
  return context;
}
