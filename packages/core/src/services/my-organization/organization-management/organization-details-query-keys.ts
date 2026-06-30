/**
 * Organization details query keys for TanStack Query cache management.
 * @module organization-details-query-keys
 */
export const organizationDetailsQueryKeys = {
  all: ['organization-details'] as const,
  details: () => [...organizationDetailsQueryKeys.all, 'details'] as const,
};
