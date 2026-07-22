'use client';

/**
 * Permission context and provider.
 *
 * Implements the eager (app-init) permissions gating
 * @module permission-context
 * @internal
 */

import { PERMISSION_MANIFEST, permissionQueryKeys } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';

export const PERMISSION_STALE_TIME_MS = 5 * 60 * 1000;

export interface PermissionContextValue {
  permissions: string[];
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Context holding the current user's MyOrganization permissions.
 * `null` when no provider is present
 * @internal
 */
export const PermissionContext = React.createContext<PermissionContextValue | null>(null);

/** Props for {@link PermissionProvider}. */
export interface PermissionProviderProps {
  children: React.ReactNode;
}

/**
 * Fetches the user's MyOrganization permissions
 * @param props - Provider props.
 * @param props.children - Subtree that can consume the permission context.
 * @returns The context provider element.
 * @internal
 */
export function PermissionProvider({ children }: PermissionProviderProps): React.JSX.Element {
  const { coreClient } = useCoreClient();

  const permissionsQuery = useQuery({
    queryKey: permissionQueryKeys.list(),
    queryFn: () =>
      coreClient!.getMyOrganizationApiClient().organization.configuration.members.get({
        permissions: PERMISSION_MANIFEST.join(','),
      }),
    enabled: !!coreClient,
    staleTime: PERMISSION_STALE_TIME_MS,
  });

  const value = React.useMemo<PermissionContextValue>(
    () => ({
      permissions: permissionsQuery.data?.permissions ?? [],
      isLoading: permissionsQuery.isLoading,
      refetch: () => {
        void permissionsQuery.refetch();
      },
    }),
    [permissionsQuery.data, permissionsQuery.isLoading, permissionsQuery.refetch],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
