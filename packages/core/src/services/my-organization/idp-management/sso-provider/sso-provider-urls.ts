/**
 * Service provider (Auth0 side) values an administrator copies into their identity provider.
 * Shared by the strategy forms and the guided setup copy fields.
 * @module sso-provider-urls
 */

/**
 * Tenant name used in SAML URNs: the first label of the Auth0 domain.
 * For custom domains this is not the tenant name; callers that know the real entity ID should
 * supply it instead (see `resolveSamlMetadata` on the SAML form).
 * @param domain - Auth0 domain, e.g. `acme.us.auth0.com`.
 * @returns The first domain label, or `''`.
 */
export function getTenantFromDomain(domain: string): string {
  return domain.split('.')[0] ?? '';
}

/**
 * OAuth / OIDC callback URL. Also the ADFS WS-Federation passive URL and the Google redirect URI.
 * @param domain - Auth0 domain.
 * @returns `https://{domain}/login/callback`.
 */
export function buildCallbackUrl(domain: string): string {
  return `https://${domain}/login/callback`;
}

/**
 * SAML Single Sign-On (assertion consumer service) URL. Also the PingFederate endpoint URL.
 * @param domain - Auth0 domain.
 * @param connectionName - Connection name; omitted from the URL when empty.
 * @returns `https://{domain}/login/callback?connection={connectionName}`.
 */
export function buildSamlSsoUrl(domain: string, connectionName?: string): string {
  const query = connectionName ? `?connection=${connectionName}` : '';
  return `${buildCallbackUrl(domain)}${query}`;
}

/**
 * SAML service provider metadata URL.
 * @param domain - Auth0 domain.
 * @param connectionName - Connection name; omitted from the URL when empty.
 * @returns `https://{domain}/samlp/metadata?connection={connectionName}`.
 */
export function buildSamlMetadataUrl(domain: string, connectionName?: string): string {
  const query = connectionName ? `?connection=${connectionName}` : '';
  return `https://${domain}/samlp/metadata${query}`;
}

/**
 * Certificate used to verify signed SAML requests.
 * @param domain - Auth0 domain.
 * @returns `https://{domain}/pem?cert=connection`.
 */
export function buildSignRequestCertUrl(domain: string): string {
  return `https://${domain}/pem?cert=connection`;
}

/**
 * SAML service provider entity ID (audience). Also the PingFederate partner's entity ID.
 * @param domain - Auth0 domain.
 * @param connectionName - Connection name.
 * @returns `urn:auth0:{tenant}:{connectionName}`, or `''` without a connection name or tenant.
 */
export function buildServiceProviderEntityId(domain: string, connectionName?: string): string {
  const tenant = getTenantFromDomain(domain);
  return tenant && connectionName ? `urn:auth0:${tenant}:${connectionName}` : '';
}

/**
 * ADFS relying party trust identifier. Unlike the SAML entity ID it has no connection name.
 * @param domain - Auth0 domain.
 * @returns `urn:auth0:{tenant}`, or `''` without a tenant.
 */
export function buildAdfsRelyingPartyIdentifier(domain: string): string {
  const tenant = getTenantFromDomain(domain);
  return tenant ? `urn:auth0:${tenant}` : '';
}

/**
 * Google Workspace authorized JavaScript origin.
 * @param domain - Auth0 domain.
 * @returns `https://{domain}`.
 */
export function buildGoogleJavascriptOrigin(domain: string): string {
  return `https://${domain}`;
}

/**
 * SCIM 2.0 endpoint for a provider's provisioning.
 * @param domain - Auth0 domain.
 * @param connectionId - Provider (connection) ID.
 * @returns `https://{domain}/scim/v2/connections/{connectionId}/`.
 */
export function buildScimEndpointUrl(domain: string, connectionId: string): string {
  return `https://${domain}/scim/v2/connections/${connectionId}/`;
}

/** All service provider values for a domain and connection. */
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
 * @param options.connectionName - Connection name (SAML, PingFederate values).
 * @param options.entityId - Entity ID to use instead of the domain-derived one (custom domains).
 * @returns The values, keyed by name.
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
