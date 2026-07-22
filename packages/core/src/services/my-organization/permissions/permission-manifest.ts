/**
 * MyOrganization permission manifest.
 *
 * The full, type-safe set of MyOrganization API permissions
 * @module permission-manifest
 * @internal
 */

import type { OauthScope } from './permission-types';

export const PERMISSION_MANIFEST: readonly OauthScope[] = [
  // Members
  'read:my_org:members',
  'delete:my_org:memberships',
  // Member Roles
  'read:my_org:member_roles',
  'create:my_org:member_roles',
  'delete:my_org:member_roles',
  // Invitations
  'read:my_org:member_invitations',
  'create:my_org:member_invitations',
  'delete:my_org:member_invitations',
  // Identity Providers
  'create:my_org:identity_providers',
  'read:my_org:identity_providers',
  'update:my_org:identity_providers',
  'delete:my_org:identity_providers',
  'update:my_org:identity_providers_detach',
  // IDP Domains, Provisioning, SCIM
  'create:my_org:identity_providers_domains',
  'delete:my_org:identity_providers_domains',
  'read:my_org:identity_providers_provisioning',
  'create:my_org:identity_providers_provisioning',
  'update:my_org:identity_providers_provisioning',
  'delete:my_org:identity_providers_provisioning',
  'read:my_org:identity_providers_scim_tokens',
  'create:my_org:identity_providers_scim_tokens',
  'delete:my_org:identity_providers_scim_tokens',
  // Domains
  'read:my_org:domains',
  'create:my_org:domains',
  'update:my_org:domains',
  'delete:my_org:domains',
  // Org Details
  'read:my_org:details',
  'update:my_org:details',
  // Configuration
  'read:my_org:configuration',
];
