import { describe, it, expect } from 'vitest';

import {
  createProviderSelectionSchema,
  createProviderDetailsSchema,
  createProviderConfigureSchema,
  createSsoProviderSchema,
  providerSelectionSchema,
  providerDetailsSchema,
  ssoProviderSchema,
  type ProviderSelectionFormValues,
  type ProviderDetailsFormValues,
  type SsoProviderFormValues,
  type OktaConfigureFormValues,
  type GoogleAppsConfigureFormValues,
  type PingFederateConfigureFormValues,
  type SamlpConfigureFormValues,
  type WaadConfigureFormValues,
} from '../sso-provider-create-schema';

describe('SSO Provider Create Schema', () => {
  describe('providerSelectionSchema', () => {
    describe.each([
      { input: 'okta', shouldPass: true, description: 'Okta strategy' },
      { input: 'adfs', shouldPass: true, description: 'ADFS strategy' },
      { input: 'google-apps', shouldPass: true, description: 'Google Apps strategy' },
      { input: 'oidc', shouldPass: true, description: 'OIDC strategy' },
      { input: 'pingfederate', shouldPass: true, description: 'PingFederate strategy' },
      { input: 'samlp', shouldPass: true, description: 'SAMLP strategy' },
      { input: 'waad', shouldPass: true, description: 'WAAD/Entra ID strategy' },
    ])('when strategy is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
        const result = providerSelectionSchema.safeParse({ strategy: input });
        expect(result.success).toBe(shouldPass);
      });
    });

    describe.each([
      { input: 'invalid-strategy', shouldPass: false, description: 'invalid strategy' },
      { input: '', shouldPass: false, description: 'empty string' },
      { input: 'OKTA', shouldPass: false, description: 'uppercase (case sensitive)' },
      { input: 'azure', shouldPass: false, description: 'non-existent strategy' },
    ])('when strategy is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
        const result = providerSelectionSchema.safeParse({ strategy: input });
        expect(result.success).toBe(shouldPass);
      });
    });

    it('should reject missing strategy', () => {
      const result = providerSelectionSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null strategy', () => {
      const result = providerSelectionSchema.safeParse({ strategy: null });
      expect(result.success).toBe(false);
    });

    it('should return error message for invalid strategy', () => {
      const result = providerSelectionSchema.safeParse({ strategy: 'invalid' });
      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        // Zod returns invalid enum value message for enum mismatches
        expect(result.error.errors[0].message).toContain('Invalid enum value');
      }
    });

    it('should return custom error message for missing strategy', () => {
      const result = providerSelectionSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].message).toContain('provider strategy');
      }
    });
  });

  describe('createProviderSelectionSchema factory', () => {
    it('should use custom error message for missing strategy', () => {
      const customMessage = 'Custom strategy error';
      const customSchema = createProviderSelectionSchema({
        strategy: { errorMessage: customMessage },
      });
      const result = customSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].message).toBe(customMessage);
      }
    });
  });

  describe('providerDetailsSchema', () => {
    const validDetails: ProviderDetailsFormValues = {
      name: 'my-provider',
      display_name: 'My Provider',
    };

    describe('name field', () => {
      describe.each([
        { input: 'my-provider', shouldPass: true, description: 'kebab-case name' },
        { input: 'provider', shouldPass: true, description: 'simple name' },
        { input: 'Provider1', shouldPass: true, description: 'name with number' },
        { input: 'my-sso-provider', shouldPass: true, description: 'multiple hyphens' },
        { input: 'a', shouldPass: true, description: 'single character' },
        { input: '1provider', shouldPass: true, description: 'starts with number' },
        { input: 'provider-1', shouldPass: true, description: 'ends with number' },
      ])('when name is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = providerDetailsSchema.safeParse({
            ...validDetails,
            name: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      describe.each([
        { input: '', shouldPass: false, description: 'empty string' },
        { input: '-provider', shouldPass: false, description: 'starts with hyphen' },
        { input: 'provider-', shouldPass: false, description: 'ends with hyphen' },
        { input: 'my--provider', shouldPass: false, description: 'double hyphens' },
        { input: 'my_provider', shouldPass: false, description: 'underscore (invalid)' },
        { input: 'my provider', shouldPass: false, description: 'space (invalid)' },
        { input: 'my.provider', shouldPass: false, description: 'dot (invalid)' },
      ])('when name is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = providerDetailsSchema.safeParse({
            ...validDetails,
            name: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should reject missing name', () => {
        const { name, ...withoutName } = validDetails;
        const result = providerDetailsSchema.safeParse(withoutName);
        expect(result.success).toBe(false);
      });
    });

    describe('display_name field', () => {
      describe.each([
        { input: 'My Provider', shouldPass: true, description: 'normal display name' },
        { input: 'SSO Provider', shouldPass: true, description: 'with acronym' },
        { input: 'Provider (Production)', shouldPass: true, description: 'with parentheses' },
        { input: "Company's SSO", shouldPass: true, description: 'with apostrophe' },
        { input: 'Provider #1', shouldPass: true, description: 'with hash' },
      ])('when display_name is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = providerDetailsSchema.safeParse({
            ...validDetails,
            display_name: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should reject empty display_name', () => {
        const result = providerDetailsSchema.safeParse({
          ...validDetails,
          display_name: '',
        });
        expect(result.success).toBe(false);
      });

      it('should reject missing display_name', () => {
        const { display_name, ...withoutDisplayName } = validDetails;
        const result = providerDetailsSchema.safeParse(withoutDisplayName);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('createProviderDetailsSchema factory', () => {
    it('should use custom error message for name', () => {
      const customMessage = 'Custom name error';
      const customSchema = createProviderDetailsSchema({
        name: { errorMessage: customMessage },
      });
      const result = customSchema.safeParse({
        name: '',
        display_name: 'Test',
      });

      expect(result.success).toBe(false);
    });

    it('should use custom regex for name', () => {
      const customSchema = createProviderDetailsSchema({
        name: { regex: /^[a-z]+$/ },
      });

      expect(
        customSchema.safeParse({
          name: 'provider',
          display_name: 'Provider',
        }).success,
      ).toBe(true);

      expect(
        customSchema.safeParse({
          name: 'Provider123',
          display_name: 'Provider',
        }).success,
      ).toBe(false);
    });

    it('should use custom regex for display_name', () => {
      const customSchema = createProviderDetailsSchema({
        displayName: {
          regex: /^[A-Z]/,
          errorMessage: 'Must start with uppercase',
        },
      });

      expect(
        customSchema.safeParse({
          name: 'provider',
          display_name: 'Provider',
        }).success,
      ).toBe(true);

      expect(
        customSchema.safeParse({
          name: 'provider',
          display_name: 'provider',
        }).success,
      ).toBe(false);
    });
  });

  describe('ssoProviderSchema (merged)', () => {
    const validData: SsoProviderFormValues = {
      strategy: 'okta',
      name: 'my-okta-provider',
      display_name: 'My Okta Provider',
    };

    it('should accept valid combined data', () => {
      const result = ssoProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when strategy is missing', () => {
      const { strategy, ...withoutStrategy } = validData;
      const result = ssoProviderSchema.safeParse(withoutStrategy);
      expect(result.success).toBe(false);
    });

    it('should reject when name is missing', () => {
      const { name, ...withoutName } = validData;
      const result = ssoProviderSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });

    it('should reject when display_name is missing', () => {
      const { display_name, ...withoutDisplayName } = validData;
      const result = ssoProviderSchema.safeParse(withoutDisplayName);
      expect(result.success).toBe(false);
    });
  });

  describe('createSsoProviderSchema factory', () => {
    it('should apply custom options to merged schema', () => {
      const customSchema = createSsoProviderSchema({
        strategy: { errorMessage: 'Select a strategy' },
        name: { regex: /^[a-z-]+$/ },
      });

      expect(
        customSchema.safeParse({
          strategy: 'okta',
          name: 'my-provider',
          display_name: 'My Provider',
        }).success,
      ).toBe(true);
    });
  });

  describe('createProviderConfigureSchema', () => {
    describe('Okta strategy', () => {
      const validOktaConfig: OktaConfigureFormValues = {
        domain: 'mycompany.okta.com',
        client_id: 'abc123',
        client_secret: 'secret123',
        icon_url: 'https://example.com/icon.png',
        callback_url: 'https://example.com/callback',
        show_as_button: true,
        assign_membership_on_login: false,
      };

      it('should accept valid Okta configuration', () => {
        const schema = createProviderConfigureSchema('okta');
        const result = schema.safeParse(validOktaConfig);
        expect(result.success).toBe(true);
      });

      it('should reject missing required domain', () => {
        const schema = createProviderConfigureSchema('okta');
        const { domain, ...withoutDomain } = validOktaConfig;
        const result = schema.safeParse(withoutDomain);
        expect(result.success).toBe(false);
      });

      it('should reject missing required client_id', () => {
        const schema = createProviderConfigureSchema('okta');
        const { client_id, ...withoutClientId } = validOktaConfig;
        const result = schema.safeParse(withoutClientId);
        expect(result.success).toBe(false);
      });

      it('should reject missing required client_secret', () => {
        const schema = createProviderConfigureSchema('okta');
        const { client_secret, ...withoutClientSecret } = validOktaConfig;
        const result = schema.safeParse(withoutClientSecret);
        expect(result.success).toBe(false);
      });

      it('should accept missing optional icon_url', () => {
        const schema = createProviderConfigureSchema('okta');
        const { icon_url, ...withoutIconUrl } = validOktaConfig;
        const result = schema.safeParse(withoutIconUrl);
        expect(result.success).toBe(true);
      });

      it('should accept missing optional callback_url', () => {
        const schema = createProviderConfigureSchema('okta');
        const { callback_url, ...withoutCallbackUrl } = validOktaConfig;
        const result = schema.safeParse(withoutCallbackUrl);
        expect(result.success).toBe(true);
      });

      it('should accept custom options', () => {
        const schema = createProviderConfigureSchema('okta', {
          okta: {
            domain: { errorMessage: 'Custom domain error' },
          },
        });
        const result = schema.safeParse({
          domain: '',
          client_id: 'abc',
          client_secret: 'secret',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('ADFS strategy', () => {
      it('should accept valid ADFS config with meta_data_url source', () => {
        const schema = createProviderConfigureSchema('adfs');
        const result = schema.safeParse({
          meta_data_source: 'meta_data_url',
          adfs_server: 'https://adfs.example.com',
          meta_data_location_url: 'https://adfs.example.com/metadata',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid ADFS config with meta_data_file source', () => {
        const schema = createProviderConfigureSchema('adfs');
        const result = schema.safeParse({
          meta_data_source: 'meta_data_file',
          fedMetadataXml: '<xml>metadata</xml>',
        });
        expect(result.success).toBe(true);
      });

      it('should reject meta_data_url source without adfs_server', () => {
        const schema = createProviderConfigureSchema('adfs');
        const result = schema.safeParse({
          meta_data_source: 'meta_data_url',
        });
        expect(result.success).toBe(false);
      });

      it('should reject meta_data_file source without fedMetadataXml', () => {
        const schema = createProviderConfigureSchema('adfs');
        const result = schema.safeParse({
          meta_data_source: 'meta_data_file',
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid meta_data_source', () => {
        const schema = createProviderConfigureSchema('adfs');
        const result = schema.safeParse({
          meta_data_source: 'invalid_source',
          adfs_server: 'https://adfs.example.com',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('Google Apps strategy', () => {
      const validGoogleConfig: GoogleAppsConfigureFormValues = {
        domain: 'mycompany.com',
        client_id: 'abc123.apps.googleusercontent.com',
        client_secret: 'secret123',
        icon_url: 'https://example.com/icon.png',
        callback_url: 'https://example.com/callback',
        show_as_button: true,
        assign_membership_on_login: false,
      };

      it('should accept valid Google Apps configuration', () => {
        const schema = createProviderConfigureSchema('google-apps');
        const result = schema.safeParse(validGoogleConfig);
        expect(result.success).toBe(true);
      });

      it('should reject missing required domain', () => {
        const schema = createProviderConfigureSchema('google-apps');
        const { domain, ...withoutDomain } = validGoogleConfig;
        const result = schema.safeParse(withoutDomain);
        expect(result.success).toBe(false);
      });

      it('should reject missing required client_id', () => {
        const schema = createProviderConfigureSchema('google-apps');
        const { client_id, ...withoutClientId } = validGoogleConfig;
        const result = schema.safeParse(withoutClientId);
        expect(result.success).toBe(false);
      });

      it('should reject missing required client_secret', () => {
        const schema = createProviderConfigureSchema('google-apps');
        const { client_secret, ...withoutClientSecret } = validGoogleConfig;
        const result = schema.safeParse(withoutClientSecret);
        expect(result.success).toBe(false);
      });
    });

    describe('OIDC strategy', () => {
      it('should accept valid OIDC back_channel configuration', () => {
        const schema = createProviderConfigureSchema('oidc');
        const result = schema.safeParse({
          type: 'back_channel',
          client_id: 'abc123',
          client_secret: 'secret123',
          discovery_url: 'https://example.com/.well-known/openid-configuration',
          show_as_button: true,
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid OIDC front_channel configuration', () => {
        const schema = createProviderConfigureSchema('oidc');
        const result = schema.safeParse({
          type: 'front_channel',
          client_id: 'abc123',
          discovery_url: 'https://example.com/.well-known/openid-configuration',
        });
        expect(result.success).toBe(true);
      });

      it('should reject back_channel without client_secret', () => {
        const schema = createProviderConfigureSchema('oidc');
        const result = schema.safeParse({
          type: 'back_channel',
          client_id: 'abc123',
          discovery_url: 'https://example.com/.well-known/openid-configuration',
        });
        expect(result.success).toBe(false);
      });

      it('should accept front_channel without client_secret', () => {
        const schema = createProviderConfigureSchema('oidc');
        const result = schema.safeParse({
          type: 'front_channel',
          client_id: 'abc123',
          discovery_url: 'https://example.com/.well-known/openid-configuration',
        });
        expect(result.success).toBe(true);
      });

      it('should reject invalid type', () => {
        const schema = createProviderConfigureSchema('oidc');
        const result = schema.safeParse({
          type: 'invalid_type',
          client_id: 'abc123',
          discovery_url: 'https://example.com/.well-known/openid-configuration',
        });
        expect(result.success).toBe(false);
      });

      it('should reject missing discovery_url', () => {
        const schema = createProviderConfigureSchema('oidc');
        const result = schema.safeParse({
          type: 'back_channel',
          client_id: 'abc123',
          client_secret: 'secret123',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('PingFederate strategy', () => {
      const validPingConfig: PingFederateConfigureFormValues = {
        pingFederateBaseUrl: 'https://pingfederate.example.com',
        signatureAlgorithm: 'rsa-sha256',
        digestAlgorithm: 'sha256',
        signSAMLRequest: true,
        signingCert: 'MIIC...certificate...',
        cert: 'MIIC...cert...',
        icon_url: 'https://example.com/icon.png',
        show_as_button: true,
      };

      it('should accept valid PingFederate configuration', () => {
        const schema = createProviderConfigureSchema('pingfederate');
        const result = schema.safeParse(validPingConfig);
        expect(result.success).toBe(true);
      });

      it('should reject missing required pingFederateBaseUrl', () => {
        const schema = createProviderConfigureSchema('pingfederate');
        const { pingFederateBaseUrl, ...withoutBaseUrl } = validPingConfig;
        const result = schema.safeParse(withoutBaseUrl);
        expect(result.success).toBe(false);
      });

      it('should reject missing required signatureAlgorithm', () => {
        const schema = createProviderConfigureSchema('pingfederate');
        const { signatureAlgorithm, ...withoutSignatureAlgorithm } = validPingConfig;
        const result = schema.safeParse(withoutSignatureAlgorithm);
        expect(result.success).toBe(false);
      });

      it('should reject missing required signSAMLRequest', () => {
        const schema = createProviderConfigureSchema('pingfederate');
        const { signSAMLRequest, ...withoutSignSAMLRequest } = validPingConfig;
        const result = schema.safeParse(withoutSignSAMLRequest);
        expect(result.success).toBe(false);
      });

      it('should accept optional idpInitiated configuration', () => {
        const schema = createProviderConfigureSchema('pingfederate');
        const result = schema.safeParse({
          ...validPingConfig,
          idpInitiated: {
            enabled: true,
            client_id: 'client123',
            client_protocol: 'samlp',
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe('SAMLP strategy', () => {
      const validSamlConfig: SamlpConfigureFormValues = {
        meta_data_source: 'url',
        single_sign_on_login_url: 'https://idp.example.com/sso',
        signatureAlgorithm: 'rsa-sha256',
        digestAlgorithm: 'sha256',
        protocolBinding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        signSAMLRequest: true,
        bindingMethod: 'POST',
        metadataUrl: 'https://idp.example.com/metadata',
        cert: 'MIIC...certificate...',
        icon_url: 'https://example.com/icon.png',
        show_as_button: true,
      };

      it('should accept valid SAMLP configuration', () => {
        const schema = createProviderConfigureSchema('samlp');
        const result = schema.safeParse(validSamlConfig);
        expect(result.success).toBe(true);
      });

      it('should reject missing required meta_data_source', () => {
        const schema = createProviderConfigureSchema('samlp');
        const { meta_data_source, ...withoutMetaDataSource } = validSamlConfig;
        const result = schema.safeParse(withoutMetaDataSource);
        expect(result.success).toBe(false);
      });

      it('should reject missing required signSAMLRequest', () => {
        const schema = createProviderConfigureSchema('samlp');
        const { signSAMLRequest, ...withoutSignSAMLRequest } = validSamlConfig;
        const result = schema.safeParse(withoutSignSAMLRequest);
        expect(result.success).toBe(false);
      });

      it('should reject missing required metadataUrl', () => {
        const schema = createProviderConfigureSchema('samlp');
        const { metadataUrl, ...withoutMetadataUrl } = validSamlConfig;
        const result = schema.safeParse(withoutMetadataUrl);
        expect(result.success).toBe(false);
      });

      it('should reject missing required cert', () => {
        const schema = createProviderConfigureSchema('samlp');
        const { cert, ...withoutCert } = validSamlConfig;
        const result = schema.safeParse(withoutCert);
        expect(result.success).toBe(false);
      });

      it('should accept optional idpInitiated configuration', () => {
        const schema = createProviderConfigureSchema('samlp');
        const result = schema.safeParse({
          ...validSamlConfig,
          idpInitiated: {
            enabled: true,
            client_id: 'client123',
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe('WAAD (Entra ID) strategy', () => {
      const validWaadConfig: WaadConfigureFormValues = {
        tenant_domain: 'mycompany.onmicrosoft.com',
        client_id: 'abc123-def456',
        client_secret: 'secret123',
        icon_url: 'https://example.com/icon.png',
        callback_url: 'https://example.com/callback',
        show_as_button: true,
        assign_membership_on_login: false,
      };

      it('should accept valid WAAD configuration', () => {
        const schema = createProviderConfigureSchema('waad');
        const result = schema.safeParse(validWaadConfig);
        expect(result.success).toBe(true);
      });

      it('should reject missing required tenant_domain', () => {
        const schema = createProviderConfigureSchema('waad');
        const { tenant_domain, ...withoutTenantDomain } = validWaadConfig;
        const result = schema.safeParse(withoutTenantDomain);
        expect(result.success).toBe(false);
      });

      it('should reject missing required client_id', () => {
        const schema = createProviderConfigureSchema('waad');
        const { client_id, ...withoutClientId } = validWaadConfig;
        const result = schema.safeParse(withoutClientId);
        expect(result.success).toBe(false);
      });

      it('should reject missing required client_secret', () => {
        const schema = createProviderConfigureSchema('waad');
        const { client_secret, ...withoutClientSecret } = validWaadConfig;
        const result = schema.safeParse(withoutClientSecret);
        expect(result.success).toBe(false);
      });

      it('should accept missing optional icon_url', () => {
        const schema = createProviderConfigureSchema('waad');
        const { icon_url, ...withoutIconUrl } = validWaadConfig;
        const result = schema.safeParse(withoutIconUrl);
        expect(result.success).toBe(true);
      });

      it('should accept missing optional callback_url', () => {
        const schema = createProviderConfigureSchema('waad');
        const { callback_url, ...withoutCallbackUrl } = validWaadConfig;
        const result = schema.safeParse(withoutCallbackUrl);
        expect(result.success).toBe(true);
      });
    });

    describe('error handling', () => {
      it('should throw error for unsupported strategy', () => {
        expect(() => {
          // @ts-expect-error - testing runtime error for invalid strategy
          createProviderConfigureSchema('unsupported-strategy');
        }).toThrow('Unsupported strategy: unsupported-strategy');
      });
    });
  });

  describe('type inference', () => {
    it('should correctly infer ProviderSelectionFormValues type', () => {
      const validData: ProviderSelectionFormValues = {
        strategy: 'okta',
      };
      const result = providerSelectionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should correctly infer ProviderDetailsFormValues type', () => {
      const validData: ProviderDetailsFormValues = {
        name: 'my-provider',
        display_name: 'My Provider',
      };
      const result = providerDetailsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should correctly infer SsoProviderFormValues type', () => {
      const validData: SsoProviderFormValues = {
        strategy: 'oidc',
        name: 'my-oidc',
        display_name: 'My OIDC Provider',
      };
      const result = ssoProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty object for providerSelectionSchema', () => {
      const result = providerSelectionSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle empty object for providerDetailsSchema', () => {
      const result = providerDetailsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle null input', () => {
      const result = ssoProviderSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = ssoProviderSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should handle extra fields gracefully', () => {
      const result = providerDetailsSchema.safeParse({
        name: 'my-provider',
        display_name: 'My Provider',
        extra_field: 'should be ignored',
      });
      expect(result.success).toBe(true);
    });

    it('should handle boolean optional fields correctly', () => {
      const schema = createProviderConfigureSchema('okta');
      const result = schema.safeParse({
        domain: 'mycompany.okta.com',
        client_id: 'abc123',
        client_secret: 'secret123',
        show_as_button: false,
        assign_membership_on_login: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.show_as_button).toBe(false);
        expect(result.data.assign_membership_on_login).toBe(true);
      }
    });
  });
});
