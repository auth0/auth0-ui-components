import * as React from 'react';
import { useComponentConfig, useCoreClient } from '../hooks';
import { Spinner } from '../components/ui/spinner';

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
    const {
      config: { loader },
    } = useComponentConfig();
    const { coreClient } = useCoreClient();

    if (!coreClient) {
      return <>{loader || <Spinner />}</>;
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  WithCoreClientComponent.displayName = WrappedComponent.displayName || WrappedComponent.name;

  return WithCoreClientComponent;
}
