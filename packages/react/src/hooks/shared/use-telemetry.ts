/**
 * Hook for block components to declare their telemetry name.
 * @module use-telemetry
 * @internal
 */

import * as React from 'react';

import { useTelemetryContext } from '@/providers/telemetry-provider';

/**
 * Sets the telemetry component name for all API calls within this component tree.
 * Call this at the top of block components.
 *
 * @param componentName - The telemetry name (e.g., 'organization-sso-configuration')
 * @internal
 */
export function useTelemetry(componentName: string): void {
  const { componentRef } = useTelemetryContext();

  React.useEffect(() => {
    const previous = componentRef.current;
    componentRef.current = componentName;
    return () => {
      componentRef.current = previous;
    };
  }, [componentRef, componentName]);
}
