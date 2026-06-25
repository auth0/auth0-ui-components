/**
 * SSO provider query keys for TanStack Query cache management.
 * @module sso-provider-query-keys
 */

import type { IdpId } from './sso-provider-types';

export const ssoProviderQueryKeys = {
  all: ['sso-providers'] as const,
  list: () => [...ssoProviderQueryKeys.all, 'list'] as const,
  detail: (idpId: IdpId) => [...ssoProviderQueryKeys.all, 'detail', idpId] as const,
  organization: () => ['organization', 'details'] as const,
  provisioning: (idpId: IdpId) => [...ssoProviderQueryKeys.all, 'provisioning', idpId] as const,
  scimTokens: (idpId: IdpId) => [...ssoProviderQueryKeys.all, 'scim-tokens', idpId] as const,
};
