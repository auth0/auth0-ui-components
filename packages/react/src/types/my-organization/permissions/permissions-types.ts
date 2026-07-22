/**
 * Permissions types
 * @module permissions-types
 */

import type { OauthScope, MyOrgResource, PermissionTier } from '@auth0/universal-components-core';

export interface PermissionContextValue {
  permissions: string[];
  isLoading: boolean;
  refetch: () => void;
}

export interface PermissionProviderProps {
  children: React.ReactNode;
}

/** Return type for usePermissions hook */
export interface UsePermissionsResult {
  permissions: string[];
  isLoading: boolean;
  hasProvider: boolean;
  hasPermission: (required: OauthScope) => boolean;
  hasAnyPermission: (required: readonly OauthScope[]) => boolean;
  hasAllPermissions: (required: readonly OauthScope[]) => boolean;
  getUserTier: (resource: MyOrgResource) => PermissionTier;
  refetch: () => void;
}
