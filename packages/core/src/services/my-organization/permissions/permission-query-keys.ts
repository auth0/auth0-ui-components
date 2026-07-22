/**
 * Permission query keys for TanStack Query cache management.
 * @module permission-query-keys
 */
export const permissionQueryKeys = {
  all: ['permissions'] as const,
  list: () => [...permissionQueryKeys.all, 'list'] as const,
};
