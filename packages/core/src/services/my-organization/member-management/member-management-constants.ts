/**
 * Member management constants.
 * @module member-management-constants
 * @internal
 */

export const memberManagementQueryKeys = {
  all: ['member-management'] as const,
  invitations: () => [...memberManagementQueryKeys.all, 'invitations'] as const,
  roles: () => [...memberManagementQueryKeys.all, 'roles'] as const,
  rolesSearch: (term: string) =>
    [...memberManagementQueryKeys.all, 'roles', 'search', term] as const,
  members: () => [...memberManagementQueryKeys.all, 'members'] as const,
  memberRoles: (id: string) => [...memberManagementQueryKeys.all, 'member-roles', id] as const,
  organization: ['organization', 'details'] as const,
};

export const memberDetailQueryKeys = {
  all: ['member-detail'] as const,
  member: (id: string) => [...memberDetailQueryKeys.all, 'member', id] as const,
  memberRoles: (id: string) => [...memberDetailQueryKeys.all, 'member-roles', id] as const,
  organization: ['organization', 'details'] as const,
};
