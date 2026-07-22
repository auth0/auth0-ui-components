/**
 * Permission context and provider (eager, app-init gating).
 * @module permission-context
 * @internal
 */

'use client';

import { PERMISSION_MANIFEST, permissionQueryKeys } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { PERMISSION_STALE_TIME_MS } from '@/lib/constants/common-constants';
import type {
  PermissionContextValue,
  PermissionProviderProps,
} from '@/types/my-organization/permissions/permissions-types';

/**
 * Current user's MyOrganization permissions; `null` outside a provider.
 * @internal
 */
export const PermissionContext = React.createContext<PermissionContextValue | null>(null);

/**
 * Fetches the user's MyOrganization permissions and provides them to descendants.
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
