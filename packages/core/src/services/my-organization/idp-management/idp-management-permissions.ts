/**
 * IDP Management permission declarations.
 * @module idp-management-permissions
 * @internal
 */
import { createPermissionResolver } from '../../permissions/permission-map';

const CONFIGURE_ONLY_SCOPES = [
  'create:my_org:identity_providers_domains',
  'delete:my_org:identity_providers_domains',
  'create:my_org:identity_providers_provisioning',
  'update:my_org:identity_providers_provisioning',
  'delete:my_org:identity_providers_provisioning',
  'create:my_org:identity_providers_scim_tokens',
  'delete:my_org:identity_providers_scim_tokens',
  'create:my_org:domains',
  'update:my_org:domains',
  'delete:my_org:domains',
] as const;

export const getIdpManagementPermissions = createPermissionResolver({
  canCreateProvider: ['create:my_org:identity_providers'],
  canUpdateProvider: ['update:my_org:identity_providers'],
  canDeleteProvider: ['delete:my_org:identity_providers'],
  canDetachProvider: ['update:my_org:identity_providers_detach'],

  canAssociateDomain: ['create:my_org:identity_providers_domains'],
  canDissociateDomain: ['delete:my_org:identity_providers_domains'],
  canCreateDomain: ['create:my_org:domains'],
  canVerifyDomain: ['update:my_org:domains'],
  canDeleteDomain: ['delete:my_org:domains'],

  canCreateProvisioning: ['create:my_org:identity_providers_provisioning'],
  canUpdateProvisioning: ['update:my_org:identity_providers_provisioning'],
  canDeleteProvisioning: ['delete:my_org:identity_providers_provisioning'],

  canCreateScimToken: ['create:my_org:identity_providers_scim_tokens'],
  canDeleteScimToken: ['delete:my_org:identity_providers_scim_tokens'],

  canConfigureProvider: { any: CONFIGURE_ONLY_SCOPES },

  canShowProviderMenu: {
    any: [
      'update:my_org:identity_providers',
      'delete:my_org:identity_providers',
      'update:my_org:identity_providers_detach',
      ...CONFIGURE_ONLY_SCOPES,
    ],
  },
} as const);

export type IdpManagementPermissions = ReturnType<typeof getIdpManagementPermissions>;
