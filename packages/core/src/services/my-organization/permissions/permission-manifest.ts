/**
 * MyOrganization permission manifest.
 *
 * The full, type-safe set of MyOrganization API permissions
 * @module permission-manifest
 * @internal
 */

/**
 * All MyOrganization permissions used for UI gating, grouped by resource.
 *
 * Keep this in sync with the MyOrganization API permission model. Adding a new
 * gated action means adding its permission string here so it is requested at
 * init and becomes part of the {@link MyOrgPermission} union.
 */
export const PERMISSION_MANIFEST = [
  // Members
  'read:my_org:members',
  'delete:my_org:members',
  'delete:my_org:memberships',
  // Member Roles
  'create:my_org:member_roles',
  'delete:my_org:member_roles',
  // Invitations
  'read:my_org:member_invitations',
  'create:my_org:member_invitations',
  'delete:my_org:member_invitations',
  // Identity Providers
  'create:my_org:identity_providers',
  'update:my_org:identity_providers',
  'delete:my_org:identity_providers',
  'update:my_org:identity_providers_detach',
  // IDP Domains, Provisioning, SCIM
  'create:my_org:identity_providers_domains',
  'delete:my_org:identity_providers_domains',
  'create:my_org:identity_providers_provisioning',
  'update:my_org:identity_providers_provisioning',
  'delete:my_org:identity_providers_provisioning',
  'create:my_org:identity_providers_scim_tokens',
  'delete:my_org:identity_providers_scim_tokens',
  // Domains
  'create:my_org:domains',
  'update:my_org:domains',
  'delete:my_org:domains',
  'read:my_org:identity_providers',
  // Org Details
  'update:my_org:details',
] as const;

/** A single MyOrganization permission string from the {@link PERMISSION_MANIFEST}. */
export type MyOrgPermission = (typeof PERMISSION_MANIFEST)[number];
