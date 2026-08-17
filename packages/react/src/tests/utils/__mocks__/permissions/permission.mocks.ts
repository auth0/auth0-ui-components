import { getMemberManagementPermissions, type OauthScope } from '@auth0/universal-components-core';

/**
 * Permission fixtures for the three UX tiers, used by tests and local
 * development until the granted permissions are read from the token claim.
 */

/** Read-only access across every resource. */
export const VIEWER_PERMISSIONS: OauthScope[] = [
  'read:my_org:configuration',
  'read:my_org:details',
  'read:my_org:domains',
  'read:my_org:identity_providers',
  'read:my_org:identity_providers_provisioning',
  'read:my_org:identity_providers_scim_tokens',
  'read:my_org:member_invitations',
  'read:my_org:member_roles',
  'read:my_org:members',
];

/** Viewer plus create/update, but no destructive actions. */
export const EDITOR_PERMISSIONS: OauthScope[] = [
  ...VIEWER_PERMISSIONS,
  'create:my_org:domains',
  'create:my_org:identity_providers',
  'create:my_org:identity_providers_domains',
  'create:my_org:identity_providers_provisioning',
  'create:my_org:identity_providers_scim_tokens',
  'create:my_org:member_invitations',
  'create:my_org:member_roles',
  'update:my_org:details',
  'update:my_org:domains',
  'update:my_org:identity_providers',
  'update:my_org:identity_providers_detach',
  'update:my_org:identity_providers_provisioning',
];

/** Editor plus every destructive action. */
export const ADMIN_PERMISSIONS: OauthScope[] = [
  ...EDITOR_PERMISSIONS,
  'delete:my_org:domains',
  'delete:my_org:identity_providers',
  'delete:my_org:identity_providers_domains',
  'delete:my_org:identity_providers_provisioning',
  'delete:my_org:identity_providers_scim_tokens',
  'delete:my_org:member_invitations',
  'delete:my_org:member_roles',
  'delete:my_org:memberships',
];

/** Member Management flags resolved for each tier. */
export const ADMIN_MEMBER_PERMISSIONS = getMemberManagementPermissions(ADMIN_PERMISSIONS);
export const EDITOR_MEMBER_PERMISSIONS = getMemberManagementPermissions(EDITOR_PERMISSIONS);
export const VIEWER_MEMBER_PERMISSIONS = getMemberManagementPermissions(VIEWER_PERMISSIONS);
