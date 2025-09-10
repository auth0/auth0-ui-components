import * as React from 'react';

import { Spinner } from '../components/ui/spinner';
import { useTheme, useCoreClient } from '../hooks';

/**
 * Higher-Order Component that ensures the core client is initialized before rendering the wrapped component.
 *
 * This HOC is useful for components that depend on the core client (like MFA operations)
 * and need to wait for it to be properly initialized before they can function.
 *
 * @param WrappedComponent - The component that requires core client to be initialized
 * @returns A new component that handles core client initialization and loading states
 */
export function withCoreClient<P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.ComponentType<P> {
  const WithCoreClientComponent = (props: P) => {
    const { loader } = useTheme();
    const { coreClient } = useCoreClient();

    if (!coreClient) {
      return <>{loader || <Spinner />}</>;
    }

    return <WrappedComponent {...props} />;
  };

  WithCoreClientComponent.displayName = WrappedComponent.displayName || WrappedComponent.name;

  return WithCoreClientComponent;
}
