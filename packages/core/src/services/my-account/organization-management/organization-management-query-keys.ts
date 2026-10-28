/**
 * My Account organization query keys for TanStack Query cache management.
 * @module organization-management-query-keys
 */
export const userOrganizationQueryKeys = {
  all: ['user-organizations'] as const,
  lists: () => [...userOrganizationQueryKeys.all, 'list'] as const,
  list: (params?: { pageSize?: number; fromToken?: string }) =>
    [...userOrganizationQueryKeys.lists(), params ?? {}] as const,
  infinite: (params?: { pageSize?: number }) =>
    [...userOrganizationQueryKeys.all, 'infinite', params ?? {}] as const,
};
