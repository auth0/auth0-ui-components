/**
 * Domain Management permission declarations.
 * @module domain-management-permissions
 * @internal
 */
import { createPermissionResolver } from '../../permissions/permission-map';

/**
 * Configure associates and dissociates a domain from identity providers, so it
 * is gated on those mutations rather than on reading the provider list.
 */
export const getDomainManagementPermissions = createPermissionResolver({
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
