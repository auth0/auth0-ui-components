'use client';

import * as React from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  PermissionContextValue,
  PermissionProviderProps,
} from '@/types/permissions/permissions-types';

export const PermissionContext = React.createContext<PermissionContextValue | null>(null);

/**
 * Provides the current user's permissions to descendants.
 * @param props - Provider props.
 * @param props.children - Child components.
 * @param props.isAuthenticated - Whether the user is authenticated.
 * @returns Permission context provider.
 * @internal
 */
export function PermissionProvider({
  children,
  isAuthenticated,
}: PermissionProviderProps): React.JSX.Element {
  const { coreClient } = useCoreClient();
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    /**
     * Fetches permissions from the API.
     */
    async function fetchPermissions() {
      if (!coreClient || !isAuthenticated) {
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const permissionClient = coreClient.getPermissionApiClient();
        const fetchedPermissions = await permissionClient.getPermissions();

        if (!cancelled) {
          setPermissions(fetchedPermissions);
        }
      } catch (error) {
        console.warn('Failed to fetch permissions:', error);
        if (!cancelled) {
          setPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [coreClient, isAuthenticated]);

  const value = React.useMemo<PermissionContextValue>(
    () => ({ permissions, isLoading }),
    [permissions, isLoading],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
