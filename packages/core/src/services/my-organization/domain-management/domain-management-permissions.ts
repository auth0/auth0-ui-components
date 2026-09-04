/**
 * Domain Management permission declarations.
 * @module domain-management-permissions
 * @internal
 */
import { createPermissionResolver } from '../../permissions/permission-map';

export const getDomainManagementPermissions = createPermissionResolver({
  canListDomains: ['read:my_org:domains'],
  canCreateDomain: ['create:my_org:domains'],
  canVerifyDomain: ['update:my_org:domains'],
  canDeleteDomain: ['delete:my_org:domains'],
  canAssociateProvider: ['create:my_org:identity_providers_domains'],
  canDissociateProvider: ['delete:my_org:identity_providers_domains'],
  canConfigureDomain: {
    any: ['create:my_org:identity_providers_domains', 'delete:my_org:identity_providers_domains'],
  },
  canShowDomainMenu: {
    any: [
      'update:my_org:domains',
      'delete:my_org:domains',
      'create:my_org:identity_providers_domains',
      'delete:my_org:identity_providers_domains',
    ],
  },
} as const);

export type DomainManagementPermissions = ReturnType<typeof getDomainManagementPermissions>;
