/**
 * Organization Management permission declarations.
 * @module organization-management-permissions
 * @internal
 */
import { createPermissionResolver } from '../../permissions/permission-map';

export const getOrganizationManagementPermissions = createPermissionResolver({
  canUpdateDetails: ['update:my_org:details'],
} as const);

export type OrganizationManagementPermissions = ReturnType<
  typeof getOrganizationManagementPermissions
>;
