import { describe, it, expect } from 'vitest';

import { STRATEGIES } from '../sso-provider-constants';
import { SsoProviderMappers } from '../sso-provider-mappers';
import type { IdpStrategy } from '../sso-provider-types';

describe('SsoProviderMappers', () => {
  describe('createToAPI', () => {
    it('should transform complete form data to API request format', () => {
      const formData = {
        strategy: STRATEGIES.OKTA as IdpStrategy,
        name: 'My Okta Provider',
        display_name: 'Okta SSO',
        options: {
          domain: 'example.okta.com',
          client_id: 'client_123',
          client_secret: 'secret_456',
          icon_url: 'https://example.com/icon.png',
        },
      };

      const result = SsoProviderMappers.createToAPI(formData);

      expect(result).toEqual({
        strategy: 'okta',
        name: 'My Okta Provider',
        display_name: 'Okta SSO',
        options: {
          domain: 'example.okta.com',
          client_id: 'client_123',
          client_secret: 'secret_456',
          icon_url: 'https://example.com/icon.png',
        },
      });
    });

    it('should trim whitespace from name', () => {
      const formData = {
        strategy: STRATEGIES.OKTA as IdpStrategy,
        name: '  My Provider  ',
        display_name: 'Display',
        options: { domain: 'example.com', client_id: 'id', client_secret: 'secret' },
      };

      const result = SsoProviderMappers.createToAPI(formData);

      expect(result.name).toBe('My Provider');
    });

    describe('validation errors', () => {
      describe.each([
        { name: '', description: 'empty string' },
        { name: '   ', description: 'whitespace only' },
      ])('when name is $description', ({ name }) => {
        it('should throw error for missing name', () => {
          const formData = {
            strategy: STRATEGIES.OKTA as IdpStrategy,
            name,
            display_name: 'Display',
            options: { domain: 'example.com' },
          };

          expect(() => SsoProviderMappers.createToAPI(formData)).toThrow(
            'Provider name is required',
          );
        });
      });
    });

    describe('strategy-specific field filtering', () => {
      describe.each([
        {
          strategy: STRATEGIES.OKTA,
          validFields: ['domain', 'client_id', 'client_secret', 'icon_url'],
          options: {
            domain: 'okta.com',
            client_id: 'id',
            client_secret: 'secret',
            icon_url: 'https://icon.png',
            invalid_field: 'should_be_filtered',
          },
        },
        {
          strategy: STRATEGIES.ADFS,
          validFields: ['adfs_server', 'fedMetadataXml'],
          options: {
            adfs_server: 'adfs.example.com',
            fedMetadataXml: '<xml>metadata</xml>',
            invalid_field: 'should_be_filtered',
          },
        },
        {
          strategy: STRATEGIES.OIDC,
          validFields: ['type', 'client_id', 'client_secret', 'discovery_url'],
          options: {
            type: 'front_channel',
            client_id: 'id',
            client_secret: 'secret',
            discovery_url: 'https://discovery.url',
            invalid_field: 'should_be_filtered',
          },
        },
        {
          strategy: STRATEGIES.SAMLP,
          validFields: [
            'signatureAlgorithm',
            'digestAlgorithm',
            'protocolBinding',
            'signSAMLRequest',
            'bindingMethod',
            'metadataUrl',
            'cert',
            'idpInitiated',
            'icon_url',
          ],
          options: {
            signatureAlgorithm: 'rsa-sha256',
            digestAlgorithm: 'sha256',
            metadataUrl: 'https://metadata.url',
            invalid_field: 'should_be_filtered',
          },
        },
        {
          strategy: STRATEGIES.GOOGLE_APPS,
          validFields: ['domain', 'client_id', 'client_secret', 'icon_url'],
          options: {
            domain: 'google.com',
            client_id: 'id',
            client_secret: 'secret',
            invalid_field: 'should_be_filtered',
          },
        },
        {
          strategy: STRATEGIES.WAAD,
          validFields: ['domain', 'client_id', 'client_secret', 'icon_url'],
          options: {
            domain: 'tenant.onmicrosoft.com',
            client_id: 'id',
            client_secret: 'secret',
            invalid_field: 'should_be_filtered',
          },
        },
        {
          strategy: STRATEGIES.PINGFEDERATE,
          validFields: [
            'signatureAlgorithm',
            'digestAlgorithm',
            'signSAMLRequest',
            'metadataUrl',
            'cert',
            'signingCert',
            'idpInitiated',
            'icon_url',
          ],
          options: {
            signatureAlgorithm: 'rsa-sha256',
            metadataUrl: 'https://ping.metadata',
            invalid_field: 'should_be_filtered',
          },
        },
      ])('for $strategy strategy', ({ strategy, options }) => {
        it('should include only valid fields and filter out invalid ones', () => {
          const formData = {
            strategy: strategy as IdpStrategy,
            name: 'Provider',
            display_name: 'Display',
            options,
          };

          const result = SsoProviderMappers.createToAPI(formData);

          expect(result.options).not.toHaveProperty('invalid_field');
          // Verify at least one valid field is present
          expect(Object.keys(result.options as object).length).toBeGreaterThan(0);
        });
      });

      it('should filter out empty, null, and undefined values', () => {
        const formData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          name: 'Provider',
          display_name: 'Display',
          options: {
            domain: 'example.com',
            client_id: '',
            client_secret: null as unknown as string,
            icon_url: undefined as unknown as string,
          },
        };

        const result = SsoProviderMappers.createToAPI(formData);

        expect(result.options).toEqual({ domain: 'example.com' });
      });

      it('should throw error for unsupported strategy', () => {
        const formData = {
          strategy: 'unsupported-strategy' as IdpStrategy,
          name: 'Provider',
          display_name: 'Display',
          options: { some_field: 'value' },
        } as Parameters<typeof SsoProviderMappers.createToAPI>[0];

        expect(() => SsoProviderMappers.createToAPI(formData)).toThrow(
          'Unsupported identity provider strategy: unsupported-strategy',
        );
      });
    });

    describe('edge cases', () => {
      it('should handle unicode and special characters in display_name', () => {
        const formData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          name: 'provider-name',
          display_name: 'Test Provider™ © 日本語 🚀 <script>',
          options: { domain: 'example.com', client_id: 'id', client_secret: 'secret' },
        };

        const result = SsoProviderMappers.createToAPI(formData);

        expect(result.display_name).toBe('Test Provider™ © 日本語 🚀 <script>');
      });

      it('should handle empty options object', () => {
        const formData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          name: 'Provider',
          display_name: 'Display',
          options: {},
        };

        const result = SsoProviderMappers.createToAPI(formData);

        expect(result.options).toEqual({});
      });
    });
  });

  describe('updateToAPI', () => {
    it('should transform complete update data to API request format', () => {
      const updateData = {
        strategy: STRATEGIES.OKTA as IdpStrategy,
        display_name: 'Updated Display',
        is_enabled: true,
        show_as_button: false,
        assign_membership_on_login: true,
        domain: 'updated.okta.com',
        client_id: 'new_client_id',
        client_secret: 'new_secret',
      };

      const result = SsoProviderMappers.updateToAPI(updateData);

      expect(result).toEqual({
        display_name: 'Updated Display',
        is_enabled: true,
        show_as_button: false,
        assign_membership_on_login: true,
        options: {
          domain: 'updated.okta.com',
          client_id: 'new_client_id',
          client_secret: 'new_secret',
        },
      });
    });

    describe('partial updates', () => {
      describe.each([
        { field: 'display_name', value: 'New Display' },
        { field: 'is_enabled', value: true },
        { field: 'is_enabled', value: false },
        { field: 'show_as_button', value: true },
        { field: 'show_as_button', value: false },
        { field: 'assign_membership_on_login', value: true },
        { field: 'assign_membership_on_login', value: false },
      ])('when only $field is provided with value $value', ({ field, value }) => {
        it(`should include only ${field} in the request`, () => {
          const updateData = { [field]: value };

          const result = SsoProviderMappers.updateToAPI(updateData);

          expect(result).toEqual({ [field]: value });
        });
      });
    });

    describe('options filtering', () => {
      it('should include valid options when strategy is provided', () => {
        const updateData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          domain: 'example.com',
          client_id: 'id',
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result.options).toEqual({
          domain: 'example.com',
          client_id: 'id',
        });
      });

      it('should not include options when strategy is missing', () => {
        const updateData = {
          display_name: 'New Display',
          domain: 'example.com',
          client_id: 'id',
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result).not.toHaveProperty('options');
        expect(result).toEqual({ display_name: 'New Display' });
      });

      it('should not include options when no config options are provided', () => {
        const updateData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          display_name: 'New Display',
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result).not.toHaveProperty('options');
        expect(result).toEqual({ display_name: 'New Display' });
      });

      it('should not include options when all config values are invalid', () => {
        const updateData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          display_name: 'New Display',
          domain: '',
          client_id: null as unknown as string,
          client_secret: undefined as unknown as string,
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result).not.toHaveProperty('options');
      });

      it('should filter invalid strategy fields from options', () => {
        const updateData = {
          strategy: STRATEGIES.OKTA as IdpStrategy,
          domain: 'example.com',
          invalid_field: 'should_be_filtered',
          adfs_server: 'should_also_be_filtered',
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result.options).toEqual({ domain: 'example.com' });
        expect(result.options).not.toHaveProperty('invalid_field');
        expect(result.options).not.toHaveProperty('adfs_server');
      });
    });

    describe('edge cases', () => {
      it('should return empty object when no fields provided', () => {
        const result = SsoProviderMappers.updateToAPI({});

        expect(result).toEqual({});
      });

      it('should handle boolean false values correctly', () => {
        const updateData = {
          is_enabled: false,
          show_as_button: false,
          assign_membership_on_login: false,
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result).toEqual({
          is_enabled: false,
          show_as_button: false,
          assign_membership_on_login: false,
        });
      });

      it('should handle unicode and special characters', () => {
        const updateData = {
          display_name: 'Updated™ © 日本語 🚀',
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result.display_name).toBe('Updated™ © 日本語 🚀');
      });

      it('should handle empty string display_name', () => {
        const updateData = {
          display_name: '',
        };

        const result = SsoProviderMappers.updateToAPI(updateData);

        expect(result).toEqual({ display_name: '' });
      });
    });
  });
});
