import { describe, it, expect } from 'vitest';

import {
  createProvisioningDetailsSchema,
  createSsoProvisioningSchema,
  provisioningDetailsSchema,
  ssoProvisioningSchema,
  type ProvisioningDetailsFormValues,
  type SsoProvisioningFormValues,
} from '../sso-provisioning-edit-schema';

describe('SSO Provisioning Edit Schema', () => {
  const validProvisioningDetails: ProvisioningDetailsFormValues = {
    userIdAttribute: 'user_id',
    scimEndpointUrl: 'https://scim.example.com/v2',
  };

  describe('provisioningDetailsSchema (default)', () => {
    describe('userIdAttribute field', () => {
      describe.each([
        { input: 'user_id', shouldPass: true, description: 'snake_case attribute' },
        { input: 'userId', shouldPass: true, description: 'camelCase attribute' },
        { input: 'USER_ID', shouldPass: true, description: 'UPPER_SNAKE_CASE attribute' },
        { input: '_private', shouldPass: true, description: 'starts with underscore' },
        { input: 'id', shouldPass: true, description: 'simple attribute' },
        { input: 'attr123', shouldPass: true, description: 'attribute with numbers' },
        { input: 'user_id_123', shouldPass: true, description: 'mixed with numbers' },
        { input: 'a', shouldPass: true, description: 'single character' },
        { input: 'A', shouldPass: true, description: 'single uppercase character' },
      ])('when userIdAttribute is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = provisioningDetailsSchema.safeParse({
            ...validProvisioningDetails,
            userIdAttribute: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      describe.each([
        { input: '', shouldPass: false, description: 'empty string' },
        { input: '123abc', shouldPass: false, description: 'starts with number' },
        { input: 'user-id', shouldPass: false, description: 'contains hyphen' },
        { input: 'user.id', shouldPass: false, description: 'contains dot' },
        { input: 'user id', shouldPass: false, description: 'contains space' },
        { input: 'user@id', shouldPass: false, description: 'contains special char' },
        { input: '1', shouldPass: false, description: 'single digit' },
      ])('when userIdAttribute is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = provisioningDetailsSchema.safeParse({
            ...validProvisioningDetails,
            userIdAttribute: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should reject missing userIdAttribute', () => {
        const { userIdAttribute, ...withoutUserIdAttribute } = validProvisioningDetails;
        const result = provisioningDetailsSchema.safeParse(withoutUserIdAttribute);
        expect(result.success).toBe(false);
      });

      it('should return correct error message for invalid userIdAttribute', () => {
        const result = provisioningDetailsSchema.safeParse({
          ...validProvisioningDetails,
          userIdAttribute: '',
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('User ID attribute is required');
        }
      });
    });

    describe('scimEndpointUrl field', () => {
      describe.each([
        { input: 'https://scim.example.com', shouldPass: true, description: 'https URL' },
        { input: 'http://scim.example.com', shouldPass: true, description: 'http URL' },
        {
          input: 'https://scim.example.com/v2/Users',
          shouldPass: true,
          description: 'URL with path',
        },
        {
          input: 'https://api.example.com:8443/scim',
          shouldPass: true,
          description: 'URL with port',
        },
        {
          input: 'https://scim.example.com/v2?query=test',
          shouldPass: true,
          description: 'URL with query',
        },
      ])('when scimEndpointUrl is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = provisioningDetailsSchema.safeParse({
            ...validProvisioningDetails,
            scimEndpointUrl: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      describe.each([
        { input: 'ftp://scim.example.com', shouldPass: false, description: 'FTP protocol' },
        { input: 'scim.example.com', shouldPass: false, description: 'missing protocol' },
        { input: 'not-a-url', shouldPass: false, description: 'plain text' },
      ])('when scimEndpointUrl is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = provisioningDetailsSchema.safeParse({
            ...validProvisioningDetails,
            scimEndpointUrl: input,
          });
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should accept undefined scimEndpointUrl (optional field)', () => {
        const result = provisioningDetailsSchema.safeParse({
          userIdAttribute: 'user_id',
          scimEndpointUrl: undefined,
        });
        expect(result.success).toBe(true);
      });

      it('should accept missing scimEndpointUrl (optional field)', () => {
        const result = provisioningDetailsSchema.safeParse({
          userIdAttribute: 'user_id',
        });
        expect(result.success).toBe(true);
      });

      it('should return correct error message for invalid scimEndpointUrl', () => {
        const result = provisioningDetailsSchema.safeParse({
          ...validProvisioningDetails,
          scimEndpointUrl: 'invalid-url',
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Must be a valid URL');
        }
      });
    });
  });

  describe('createProvisioningDetailsSchema factory', () => {
    describe('with custom userIdAttribute options', () => {
      it('should use custom error message', () => {
        const customMessage = 'Custom user ID error';
        const customSchema = createProvisioningDetailsSchema({
          userIdAttribute: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          userIdAttribute: '',
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });

      it('should allow optional userIdAttribute when required is false', () => {
        const customSchema = createProvisioningDetailsSchema({
          userIdAttribute: { required: false },
        });
        const result = customSchema.safeParse({
          scimEndpointUrl: 'https://scim.example.com',
        });

        // When required is false, empty string should still fail regex
        // but undefined/missing should work
        expect(result.success).toBe(true);
      });

      it('should use custom regex for userIdAttribute', () => {
        // Only allow lowercase attributes
        const customSchema = createProvisioningDetailsSchema({
          userIdAttribute: {
            regex: /^[a-z_]+$/,
            errorMessage: 'Only lowercase letters and underscores allowed',
          },
        });

        expect(
          customSchema.safeParse({
            userIdAttribute: 'user_id',
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            userIdAttribute: 'USER_ID',
          }).success,
        ).toBe(false);
      });

      it('should enforce minLength constraint', () => {
        const customSchema = createProvisioningDetailsSchema({
          userIdAttribute: { minLength: 5 },
        });

        expect(
          customSchema.safeParse({
            userIdAttribute: 'uid',
          }).success,
        ).toBe(false);

        expect(
          customSchema.safeParse({
            userIdAttribute: 'user_id',
          }).success,
        ).toBe(true);
      });

      it('should enforce maxLength constraint', () => {
        const customSchema = createProvisioningDetailsSchema({
          userIdAttribute: { maxLength: 10 },
        });

        expect(
          customSchema.safeParse({
            userIdAttribute: 'uid',
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            userIdAttribute: 'very_long_user_id_attribute',
          }).success,
        ).toBe(false);
      });
    });

    describe('with custom scimEndpointUrl options', () => {
      it('should use custom error message', () => {
        const customMessage = 'Custom SCIM URL error';
        const customSchema = createProvisioningDetailsSchema({
          scimEndpointUrl: { errorMessage: customMessage },
        });
        const result = customSchema.safeParse({
          userIdAttribute: 'user_id',
          scimEndpointUrl: 'invalid',
        });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });

      it('should use custom regex for scimEndpointUrl', () => {
        // Only allow HTTPS URLs
        const customSchema = createProvisioningDetailsSchema({
          scimEndpointUrl: {
            regex: /^https:\/\/.+/,
            errorMessage: 'Only HTTPS URLs allowed',
          },
        });

        expect(
          customSchema.safeParse({
            userIdAttribute: 'user_id',
            scimEndpointUrl: 'https://scim.example.com',
          }).success,
        ).toBe(true);

        expect(
          customSchema.safeParse({
            userIdAttribute: 'user_id',
            scimEndpointUrl: 'http://scim.example.com',
          }).success,
        ).toBe(false);
      });
    });

    describe('with empty options', () => {
      it('should behave like the default schema', () => {
        const schemaWithEmptyOptions = createProvisioningDetailsSchema({});

        expect(schemaWithEmptyOptions.safeParse(validProvisioningDetails).success).toBe(true);
        expect(
          schemaWithEmptyOptions.safeParse({
            userIdAttribute: '',
          }).success,
        ).toBe(false);
      });
    });

    describe('with undefined options', () => {
      it('should behave like the default schema', () => {
        const schemaWithUndefinedOptions = createProvisioningDetailsSchema(undefined);

        expect(schemaWithUndefinedOptions.safeParse(validProvisioningDetails).success).toBe(true);
      });
    });

    describe('with multiple custom options', () => {
      it('should apply all custom options correctly', () => {
        const customSchema = createProvisioningDetailsSchema({
          userIdAttribute: {
            errorMessage: 'Custom user ID error',
            minLength: 3,
          },
          scimEndpointUrl: {
            errorMessage: 'Custom URL error',
          },
        });

        expect(customSchema.safeParse(validProvisioningDetails).success).toBe(true);
      });
    });
  });

  describe('ssoProvisioningSchema (default)', () => {
    it('should accept valid SSO provisioning data', () => {
      const validData: SsoProvisioningFormValues = {
        userIdAttribute: 'user_id',
        scimEndpointUrl: 'https://scim.example.com/v2',
      };
      const result = ssoProvisioningSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should behave identically to provisioningDetailsSchema', () => {
      // Valid data
      expect(ssoProvisioningSchema.safeParse(validProvisioningDetails).success).toBe(
        provisioningDetailsSchema.safeParse(validProvisioningDetails).success,
      );

      // Invalid data
      const invalidData = { userIdAttribute: '' };
      expect(ssoProvisioningSchema.safeParse(invalidData).success).toBe(
        provisioningDetailsSchema.safeParse(invalidData).success,
      );
    });
  });

  describe('createSsoProvisioningSchema factory', () => {
    it('should create schema with custom options', () => {
      const customSchema = createSsoProvisioningSchema({
        userIdAttribute: { errorMessage: 'Custom error' },
      });
      const result = customSchema.safeParse({ userIdAttribute: '' });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].message).toBe('Custom error');
      }
    });

    it('should behave like createProvisioningDetailsSchema', () => {
      const ssoSchema = createSsoProvisioningSchema({
        userIdAttribute: { minLength: 5 },
      });
      const provSchema = createProvisioningDetailsSchema({
        userIdAttribute: { minLength: 5 },
      });

      const testData = { userIdAttribute: 'uid' };
      expect(ssoSchema.safeParse(testData).success).toBe(provSchema.safeParse(testData).success);
    });
  });

  describe('type inference', () => {
    it('should correctly infer ProvisioningDetailsFormValues type', () => {
      const validData: ProvisioningDetailsFormValues = {
        userIdAttribute: 'user_id',
        scimEndpointUrl: 'https://scim.example.com',
      };
      const result = provisioningDetailsSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userIdAttribute).toBe('user_id');
        expect(result.data.scimEndpointUrl).toBe('https://scim.example.com');
      }
    });

    it('should correctly infer SsoProvisioningFormValues type', () => {
      const validData: SsoProvisioningFormValues = {
        userIdAttribute: 'email',
      };
      const result = ssoProvisioningSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userIdAttribute).toBe('email');
      }
    });
  });

  describe('edge cases', () => {
    it('should reject null userIdAttribute', () => {
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: null,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-string userIdAttribute', () => {
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: 12345,
      });
      expect(result.success).toBe(false);
    });

    it('should reject array as userIdAttribute', () => {
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: ['user_id'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject object as userIdAttribute', () => {
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: { value: 'user_id' },
      });
      expect(result.success).toBe(false);
    });

    it('should handle whitespace-only userIdAttribute', () => {
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('should handle very long valid userIdAttribute', () => {
      const longAttribute = 'a'.repeat(100);
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: longAttribute,
      });
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters in userIdAttribute', () => {
      const result = provisioningDetailsSchema.safeParse({
        userIdAttribute: 'user_日本語',
      });
      expect(result.success).toBe(false); // Regex only allows [a-zA-Z_][a-zA-Z0-9_]*
    });

    it('should handle empty object', () => {
      const result = provisioningDetailsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle null input', () => {
      const result = provisioningDetailsSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = provisioningDetailsSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });
});
