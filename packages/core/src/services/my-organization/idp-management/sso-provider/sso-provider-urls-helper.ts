/**
 * Auth0-side values an administrator copies into their identity provider.
 * @module sso-provider-urls-helper
 */

/**
 * First label of the Auth0 domain, used as the tenant in SAML URNs. Wrong for custom domains.
 * @param domain - Auth0 domain.
 * @returns The tenant, or `''`.
 */
export function getTenantFromDomain(domain: string): string {
  return domain.split('.')[0] ?? '';
}

/**
 * OIDC callback URL, also used for ADFS WS-Federation and the Google redirect URI.
 * @param domain - Auth0 domain.
 * @returns The URL.
 */
export function buildCallbackUrl(domain: string): string {
  return `https://${domain}/login/callback`;
}

/**
 * SAML single sign-on URL, also the PingFederate endpoint URL.
 * @param domain - Auth0 domain.
 * @param connectionName - Connection name, URL-encoded, left out when empty.
 * @returns The URL.
 */
export function buildSamlSsoUrl(domain: string, connectionName?: string): string {
  const query = connectionName ? `?connection=${encodeURIComponent(connectionName)}` : '';
  return `${buildCallbackUrl(domain)}${query}`;
}

/**
 * SAML service provider metadata URL.
 * @param domain - Auth0 domain.
 * @param connectionName - Connection name, URL-encoded, left out when empty.
 * @returns The URL.
 */
export function buildSamlMetadataUrl(domain: string, connectionName?: string): string {
  const query = connectionName ? `?connection=${encodeURIComponent(connectionName)}` : '';
  return `https://${domain}/samlp/metadata${query}`;
}

/**
 * Certificate URL for verifying signed SAML requests.
 * @param domain - Auth0 domain.
 * @returns The URL.
 */
export function buildSignRequestCertUrl(domain: string): string {
  return `https://${domain}/pem?cert=connection`;
}

/**
 * SAML service provider entity ID, also the PingFederate partner entity ID.
 * @param domain - Auth0 domain.
 * @param connectionName - Connection name.
 * @returns The entity ID, or `''` without a tenant or connection name.
 */
export function buildServiceProviderEntityId(domain: string, connectionName?: string): string {
  const tenant = getTenantFromDomain(domain);
  return tenant && connectionName ? `urn:auth0:${tenant}:${connectionName}` : '';
}

/**
 * ADFS relying party trust identifier.
 * @param domain - Auth0 domain.
 * @returns The identifier, or `''` without a tenant.
 */
export function buildAdfsRelyingPartyIdentifier(domain: string): string {
  const tenant = getTenantFromDomain(domain);
  return tenant ? `urn:auth0:${tenant}` : '';
}

/**
 * Google Workspace authorized JavaScript origin.
 * @param domain - Auth0 domain.
 * @returns The origin.
 */
export function buildGoogleJavascriptOrigin(domain: string): string {
  return `https://${domain}`;
}

/**
 * SCIM endpoint for a provider's provisioning.
 * @param domain - Auth0 domain.
 * @param connectionId - Provider ID, URL-encoded.
 * @returns The URL.
 */
export function buildScimEndpointUrl(domain: string, connectionId: string): string {
  return `https://${domain}/scim/v2/connections/${encodeURIComponent(connectionId)}/`;
}

export interface ServiceProviderValues {
  callbackUrl: string;
  samlSsoUrl: string;
  samlMetadataUrl: string;
  signRequestCertUrl: string;
  serviceProviderEntityId: string;
  adfsWsFederationUrl: string;
  adfsRelyingPartyIdentifier: string;
  googleJavascriptOrigin: string;
  googleRedirectUri: string;
  pingFederateEndpointUrl: string;
  pingFederatePartnerEntityId: string;
}

/**
 * Builds every service provider value for a domain and connection.
 * @param domain - Auth0 domain.
 * @param options - Options.
 * @param options.connectionName - Connection name.
 * @param options.entityId - Entity ID that replaces the domain-derived one.
 * @returns The values by name.
 */
export function buildServiceProviderValues(
  domain: string,
  { connectionName, entityId }: { connectionName?: string; entityId?: string } = {},
): ServiceProviderValues {
  const callbackUrl = buildCallbackUrl(domain);
  const samlSsoUrl = buildSamlSsoUrl(domain, connectionName);
  const serviceProviderEntityId = entityId ?? buildServiceProviderEntityId(domain, connectionName);

  return {
    callbackUrl,
    samlSsoUrl,
    samlMetadataUrl: buildSamlMetadataUrl(domain, connectionName),
    signRequestCertUrl: buildSignRequestCertUrl(domain),
    serviceProviderEntityId,
    adfsWsFederationUrl: callbackUrl,
    adfsRelyingPartyIdentifier: buildAdfsRelyingPartyIdentifier(domain),
    googleJavascriptOrigin: buildGoogleJavascriptOrigin(domain),
    googleRedirectUri: callbackUrl,
    pingFederateEndpointUrl: samlSsoUrl,
    pingFederatePartnerEntityId: serviceProviderEntityId,
  };
}
