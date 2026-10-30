/**
 * Organization Details permission declarations.
 * @module organization-details-permissions
 * @internal
 */
import { createPermissionResolver } from '../../permissions/permission-map';

export const getOrganizationDetailsPermissions = createPermissionResolver({
  canUpdateDetails: ['update:my_org:details'],
  canDeleteOrganization: ['delete:my_org:organizations'],
} as const);

export type OrganizationDetailsPermissions = ReturnType<typeof getOrganizationDetailsPermissions>;
