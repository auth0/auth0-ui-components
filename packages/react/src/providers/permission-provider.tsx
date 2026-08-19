/**
 * Permission provider and context.
 * @module permission-provider
 * @internal
 */

'use client';

import * as React from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  PermissionContextValue,
  PermissionProviderProps,
} from '@/types/permissions/permissions-types';

/**
 * Current user's permissions; `null` outside a provider.
 * @internal
 */
export const PermissionContext = React.createContext<PermissionContextValue | null>(null);

/**
 * Provides the current user's permissions to descendants.
 * Auto-fetches permissions from the ID token claim via the Permission API client.
 * @param props - Provider props.
 * @param props.children - Subtree that can consume the permission context.
 * @returns The context provider element.
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
     *
     */
    async function fetchPermissions() {
      if (!coreClient || !isAuthenticated) {
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
