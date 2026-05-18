/**
 * Member management constants.
 * @module member-management-constants
 * @internal
 */

export const memberManagementQueryKeys = {
  all: ['member-management'] as const,
  invitations: () => [...memberManagementQueryKeys.all, 'invitations'] as const,
  roles: () => [...memberManagementQueryKeys.all, 'roles'] as const,
};

export const memberDetailQueryKeys = {
  all: ['member-detail'] as const,
  member: (id: string) => [...memberDetailQueryKeys.all, 'member', id] as const,
  memberRoles: (id: string) => [...memberDetailQueryKeys.all, 'member-roles', id] as const,
  roles: () => [...memberDetailQueryKeys.all, 'roles'] as const,
  organization: ['organization', 'details'] as const,
};
