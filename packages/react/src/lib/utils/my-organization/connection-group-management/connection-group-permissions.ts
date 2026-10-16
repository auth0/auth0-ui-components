/**
 * Connection group detail permission resolver.
 * @module connection-group-permissions
 * @internal
 */

import type { PermissionResolver } from '@auth0/universal-components-core';

/** Permission keys resolved for the connection group detail. */
type ConnectionGroupDetailPermissionSpec = {
  readonly canViewRoles: readonly [];
  readonly canAssignRoles: readonly [];
  readonly canRemoveRoles: readonly [];
};

/**
 * Resolves connection group detail permissions from granted scopes.
 *
 * TODO(SDK): the group role scopes are not yet part of `MyOrganization.OauthScope`,
 * so this cannot use core's typed `createPermissionResolver`. Replace with a core
 * resolver once the scopes exist in the SDK.
 * - `canViewRoles`: `read:my_org:group_roles`
 * - `canAssignRoles`: `create:my_org:group_roles`
 * - `canRemoveRoles`: `delete:my_org:group_roles`
 * @param userPermissions - Granted scopes.
 * @param options - `readOnly` denies only the write capabilities (assign/remove), never viewing; `disablePermissionEnforcement` grants every capability.
 * @returns Resolved capability flags.
 * @internal
 */
export const getConnectionGroupDetailPermissions: PermissionResolver<
  ConnectionGroupDetailPermissionSpec
> = (userPermissions, options = {}) => {
  const granted = new Set(userPermissions);
  const check = (scope: string, isWrite = false): boolean => {
    if (isWrite && options.readOnly) return false;
    if (options.disablePermissionEnforcement) return true;
    return granted.has(scope);
  };

  return {
    canViewRoles: check('read:my_org:group_roles'),
    canAssignRoles: check('create:my_org:group_roles', true),
    canRemoveRoles: check('delete:my_org:group_roles', true),
  };
};
