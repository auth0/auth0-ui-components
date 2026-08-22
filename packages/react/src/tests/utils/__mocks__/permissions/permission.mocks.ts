import {
  getDomainManagementPermissions,
  getMemberManagementPermissions,
  type OauthScope,
} from '@auth0/universal-components-core';

/** Claim carrying the caller's granted My Org permissions. */
export const MY_ORG_PERMISSIONS_CLAIM = 'urn:auth0:my_org_current_user_permissions';

/** Every My Org permission, as the claim carries them for a fully privileged member. */
export const ALL_MY_ORG_PERMISSIONS: OauthScope[] = [
  'create:my_org:domains',
  'create:my_org:identity_providers',
  'create:my_org:identity_providers_domains',
  'create:my_org:identity_providers_provisioning',
  'create:my_org:identity_providers_scim_tokens',
  'create:my_org:member_invitations',
  'create:my_org:member_roles',
  'delete:my_org:domains',
  'delete:my_org:identity_providers',
  'delete:my_org:identity_providers_domains',
  'delete:my_org:identity_providers_provisioning',
  'delete:my_org:identity_providers_scim_tokens',
  'delete:my_org:member_invitations',
  'delete:my_org:member_roles',
  'delete:my_org:memberships',
  'read:my_org:configuration',
  'read:my_org:details',
  'read:my_org:domains',
  'read:my_org:identity_providers',
  'read:my_org:identity_providers_provisioning',
  'read:my_org:identity_providers_scim_tokens',
  'read:my_org:member_invitations',
  'read:my_org:member_roles',
  'read:my_org:members',
  'update:my_org:details',
  'update:my_org:domains',
  'update:my_org:identity_providers',
  'update:my_org:identity_providers_detach',
];

/** The read-only subset of {@link ALL_MY_ORG_PERMISSIONS}. */
export const READ_ONLY_MY_ORG_PERMISSIONS: OauthScope[] = ALL_MY_ORG_PERMISSIONS.filter((scope) =>
  scope.startsWith('read:'),
);

/**
 * Wraps granted permissions in the token claim shape.
 * @param granted - Granted permissions.
 * @returns Decoded token claims.
 */
export const createTokenClaims = (
  granted: readonly OauthScope[] = ALL_MY_ORG_PERMISSIONS,
): Record<string, string[]> => ({ [MY_ORG_PERMISSIONS_CLAIM]: [...granted] });

/**
 * Resolves Member Management flags from the granted permissions.
 * @param granted - Granted permissions, as the claim carries them.
 * @returns The resolved Member Management permissions.
 */
export const createMemberPermissions = (granted: readonly OauthScope[] = ALL_MY_ORG_PERMISSIONS) =>
  getMemberManagementPermissions(granted);

/** Default for mock props: a member granted everything. */
export const ALL_MEMBER_PERMISSIONS = createMemberPermissions();

/** A member granted only read access. */
export const READ_ONLY_MEMBER_PERMISSIONS = createMemberPermissions(READ_ONLY_MY_ORG_PERMISSIONS);

/**
 * Resolves Domain Management flags from the granted permissions.
 * @param granted - Granted permissions, as the claim carries them.
 * @returns The resolved Domain Management permissions.
 */
export const createDomainPermissions = (granted: readonly OauthScope[] = ALL_MY_ORG_PERMISSIONS) =>
  getDomainManagementPermissions(granted);

/** Default for mock props: a member granted everything. */
export const ALL_DOMAIN_PERMISSIONS = createDomainPermissions();

/** A member granted only read access. */
export const READ_ONLY_DOMAIN_PERMISSIONS = createDomainPermissions(READ_ONLY_MY_ORG_PERMISSIONS);
