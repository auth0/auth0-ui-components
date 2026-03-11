import type { IdpId } from '@auth0/universal-components-core';

export const ssoProviderEditQueryKeys = {
  all: ['sso-providers'] as const,
  detail: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'detail', idpId] as const,
  organization: () => ['organization', 'details'] as const,
  provisioning: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'provisioning', idpId] as const,
  scimTokens: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'scim-tokens', idpId] as const,
};
