import { describe, expect, it } from 'vitest';

import {
  buildAdfsRelyingPartyIdentifier,
  buildCallbackUrl,
  buildGoogleJavascriptOrigin,
  buildSamlMetadataUrl,
  buildSamlSsoUrl,
  buildScimEndpointUrl,
  buildServiceProviderEntityId,
  buildServiceProviderValues,
  buildSignRequestCertUrl,
  getTenantFromDomain,
} from '../sso-provider-urls';

const DOMAIN = 'acme.us.auth0.com';

describe('sso-provider-urls', () => {
  it('derives the tenant from the first domain label', () => {
    expect(getTenantFromDomain(DOMAIN)).toBe('acme');
    expect(getTenantFromDomain('')).toBe('');
  });

  it('builds the callback URL', () => {
    expect(buildCallbackUrl(DOMAIN)).toBe('https://acme.us.auth0.com/login/callback');
  });

  describe('SAML values', () => {
    it('adds the connection to the SSO URL when present', () => {
      expect(buildSamlSsoUrl(DOMAIN, 'my-saml')).toBe(
        'https://acme.us.auth0.com/login/callback?connection=my-saml',
      );
      expect(buildSamlSsoUrl(DOMAIN)).toBe('https://acme.us.auth0.com/login/callback');
    });

    it('adds the connection to the metadata URL when present', () => {
      expect(buildSamlMetadataUrl(DOMAIN, 'my-saml')).toBe(
        'https://acme.us.auth0.com/samlp/metadata?connection=my-saml',
      );
      expect(buildSamlMetadataUrl(DOMAIN)).toBe('https://acme.us.auth0.com/samlp/metadata');
    });

    it('builds the entity ID from tenant and connection', () => {
      expect(buildServiceProviderEntityId(DOMAIN, 'my-saml')).toBe('urn:auth0:acme:my-saml');
    });

    it('returns an empty entity ID without a connection name', () => {
      expect(buildServiceProviderEntityId(DOMAIN)).toBe('');
      expect(buildServiceProviderEntityId(DOMAIN, '')).toBe('');
    });

    it('builds the sign-request certificate URL', () => {
      expect(buildSignRequestCertUrl(DOMAIN)).toBe('https://acme.us.auth0.com/pem?cert=connection');
    });
  });

  it('builds the ADFS relying party identifier without the connection', () => {
    expect(buildAdfsRelyingPartyIdentifier(DOMAIN)).toBe('urn:auth0:acme');
    expect(buildAdfsRelyingPartyIdentifier('')).toBe('');
  });

  it('builds the Google JavaScript origin', () => {
    expect(buildGoogleJavascriptOrigin(DOMAIN)).toBe('https://acme.us.auth0.com');
  });

  it('builds the SCIM endpoint with a trailing slash', () => {
    expect(buildScimEndpointUrl(DOMAIN, 'con_123')).toBe(
      'https://acme.us.auth0.com/scim/v2/connections/con_123/',
    );
  });

  describe('buildServiceProviderValues', () => {
    it('returns every value for a connection', () => {
      expect(buildServiceProviderValues(DOMAIN, { connectionName: 'my-saml' })).toEqual({
        callbackUrl: 'https://acme.us.auth0.com/login/callback',
        samlSsoUrl: 'https://acme.us.auth0.com/login/callback?connection=my-saml',
        samlMetadataUrl: 'https://acme.us.auth0.com/samlp/metadata?connection=my-saml',
        signRequestCertUrl: 'https://acme.us.auth0.com/pem?cert=connection',
        serviceProviderEntityId: 'urn:auth0:acme:my-saml',
        adfsWsFederationUrl: 'https://acme.us.auth0.com/login/callback',
        adfsRelyingPartyIdentifier: 'urn:auth0:acme',
        googleJavascriptOrigin: 'https://acme.us.auth0.com',
        googleRedirectUri: 'https://acme.us.auth0.com/login/callback',
        pingFederateEndpointUrl: 'https://acme.us.auth0.com/login/callback?connection=my-saml',
        pingFederatePartnerEntityId: 'urn:auth0:acme:my-saml',
      });
    });

    it('uses a provided entity ID for the SAML and PingFederate entity values', () => {
      const values = buildServiceProviderValues('login.acme.com', {
        connectionName: 'my-saml',
        entityId: 'urn:custom:entity',
      });

      expect(values.serviceProviderEntityId).toBe('urn:custom:entity');
      expect(values.pingFederatePartnerEntityId).toBe('urn:custom:entity');
    });

    it('matches the values the existing forms build inline', () => {
      const domain = 'tenant.auth0.com';
      const connection = 'conn';
      const values = buildServiceProviderValues(domain, { connectionName: connection });

      // okta / waad / google-apps forms
      expect(values.callbackUrl).toBe(`https://${domain}/login/callback`);
      // samlp form spMetadataUrls, signRequestCertUrl and spIssuerUrn
      expect(values.samlSsoUrl).toBe(`https://${domain}/login/callback?connection=${connection}`);
      expect(values.samlMetadataUrl).toBe(
        `https://${domain}/samlp/metadata?connection=${connection}`,
      );
      expect(values.signRequestCertUrl).toBe(`https://${domain}/pem?cert=connection`);
      expect(values.serviceProviderEntityId).toBe(`urn:auth0:tenant:${connection}`);
    });
  });
});
