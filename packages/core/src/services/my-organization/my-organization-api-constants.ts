/**
 * OAuth scopes for My Organization API operations.
 * @module my-organization-api-constants
 * @internal
 */

/**
 * Required OAuth scopes for organization details editing.
 * @internal
 */
export const MY_ORGANIZATION_DETAILS_EDIT_SCOPES = 'read:my_org:details update:my_org:details';

/**
 * Required OAuth scopes for SSO provider table operations.
 * @internal
 */
export const MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES =
  'read:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:configuration';

/**
 * Required OAuth scopes for creating SSO providers.
 * @internal
 */
export const MY_ORGANIZATION_SSO_PROVIDER_CREATE_SCOPES =
  'read:my_org:identity_providers create:my_org:identity_providers read:my_org:configuration';

/**
 * Required OAuth scopes for editing SSO providers.
 * @internal
 */
export const MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES =
  'read:my_org:details update:my_org:details read:my_org:identity_providers create:my_org:identity_providers update:my_org:identity_providers delete:my_org:identity_providers update:my_org:identity_providers_detach read:my_org:identity_providers_provisioning create:my_org:identity_providers_provisioning delete:my_org:identity_providers_provisioning create:my_org:identity_providers_domains delete:my_org:identity_providers_domains read:my_org:identity_providers_scim_tokens create:my_org:identity_providers_scim_tokens delete:my_org:identity_providers_scim_tokens read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains read:my_org:configuration';

/**
 * Required OAuth scopes for domain management operations.
 * @internal
 */
export const MY_ORGANIZATION_DOMAIN_SCOPES =
  'read:my_org:domains delete:my_org:domains create:my_org:domains update:my_org:domains read:my_org:identity_providers create:my_org:identity_providers_domains delete:my_org:identity_providers_domains';
