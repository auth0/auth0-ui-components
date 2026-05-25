/**
 * SSO provider query keys for TanStack Query cache management.
 * @module sso-provider-query-keys
 */
export const ssoProviderQueryKeys = {
  all: ['sso-providers'] as const,
  list: () => [...ssoProviderQueryKeys.all, 'list'] as const,
  organization: ['organization', 'details'] as const,
};
