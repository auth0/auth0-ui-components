/**
 * Hook for reading and checking the current user's MyOrganization permissions.
 *
 * Consumes {@link PermissionContext}. When used outside a `PermissionProvider`
 * it falls back to admin-level access (the full {@link PERMISSION_MANIFEST})
 * @module use-permissions
 */

import {
  PERMISSION_MANIFEST,
  type MyOrgPermission,
  type PermissionTier,
} from '@auth0/universal-components-core';
import * as React from 'react';

import {
  getUserTier,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '@/lib/utils/my-organization/permission-utils';
import { PermissionContext } from '@/providers/permission-context';

export interface UsePermissionsResult {
  permissions: string[];
  isLoading: boolean;
  hasProvider: boolean;
  hasPermission: (required: MyOrgPermission) => boolean;
  hasAnyPermission: (required: readonly MyOrgPermission[]) => boolean;
  hasAllPermissions: (required: readonly MyOrgPermission[]) => boolean;
  getUserTier: (resource: string) => PermissionTier;
  refetch: () => void;
}

const ADMIN_FALLBACK_PERMISSIONS: string[] = [...PERMISSION_MANIFEST];

/**
 * Reads the current user's permissions and exposes type-safe check helpers.
 * @returns Permission state and check helpers. See {@link UsePermissionsResult}.
 */
export function usePermissions(): UsePermissionsResult {
  const context = React.useContext(PermissionContext);

  const permissions = context?.permissions ?? ADMIN_FALLBACK_PERMISSIONS;
  const hasProvider = context !== null;

  return React.useMemo<UsePermissionsResult>(
    () => ({
      permissions,
      isLoading: context?.isLoading ?? false,
      hasProvider,
      hasPermission: (required) => hasPermission(permissions, required),
      hasAnyPermission: (required) => hasAnyPermission(permissions, required),
      hasAllPermissions: (required) => hasAllPermissions(permissions, required),
      getUserTier: (resource) => getUserTier(permissions, resource),
      refetch: () => context?.refetch(),
    }),
    [permissions, hasProvider, context],
  );
}
