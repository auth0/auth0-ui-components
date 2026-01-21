import { describe, it, expect } from 'vitest';

import {
  createDomainCreateSchema,
  domainCreateSchema,
  type InternalDomainCreateFormValues,
} from '../domain-create-schema';

describe('Domain Create Schema', () => {
  describe('default schema', () => {
    describe.each([
      { input: 'example.com', shouldPass: true, description: 'simple domain' },
      { input: 'sub.example.com', shouldPass: true, description: 'subdomain' },
      { input: 'deep.sub.example.com', shouldPass: true, description: 'nested subdomain' },
      { input: 'https://example.com', shouldPass: true, description: 'with https protocol' },
      { input: 'http://example.com', shouldPass: true, description: 'with http protocol' },
      { input: 'example.com:8080', shouldPass: true, description: 'with port' },
      { input: 'https://example.com:443', shouldPass: true, description: 'with https and port' },
      { input: 'example.com/path', shouldPass: true, description: 'with path' },
      { input: 'example.com/path/to/resource', shouldPass: true, description: 'with nested path' },
      {
        input: 'https://example.com/path?query=value',
        shouldPass: true,
        description: 'with query params',
      },
      { input: 'localhost', shouldPass: true, description: 'localhost' },
      { input: 'localhost:3000', shouldPass: true, description: 'localhost with port' },
      { input: 'http://localhost:3000', shouldPass: true, description: 'localhost with protocol' },
      { input: 'my-domain.com', shouldPass: true, description: 'domain with hyphen' },
      { input: 'my_domain.com', shouldPass: true, description: 'domain with underscore' },
      { input: 'domain123.com', shouldPass: true, description: 'domain with numbers' },
      { input: 'EXAMPLE.COM', shouldPass: true, description: 'uppercase domain' },
      { input: 'Example.Com', shouldPass: true, description: 'mixed case domain' },
    ])('when domain_url is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
        const result = domainCreateSchema.safeParse({ domain_url: input });
        expect(result.success).toBe(shouldPass);
      });
    });

    describe.each([
      { input: '', shouldPass: false, description: 'empty string' },
      { input: '   ', shouldPass: false, description: 'whitespace only' },
      { input: '.com', shouldPass: false, description: 'missing domain name' },
      { input: 'example.', shouldPass: false, description: 'trailing dot without TLD' },
      { input: 'ftp://example.com', shouldPass: false, description: 'unsupported protocol' },
      { input: 'example..com', shouldPass: false, description: 'double dots' },
      {
        input: 'example.com:invalid',
        shouldPass: false,
        description: 'invalid port (non-numeric)',
      },
    ])('when domain_url is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
        const result = domainCreateSchema.safeParse({ domain_url: input });
        expect(result.success).toBe(shouldPass);
      });
    });

    it('should return the default error message on validation failure', () => {
      const result = domainCreateSchema.safeParse({ domain_url: '' });

      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].message).toBe(
          'Please enter a valid domain (e.g., example.com or https://example.com)',
        );
      }
    });
  });

  describe('createDomainCreateSchema factory', () => {
    describe('with custom error message', () => {
      it('should use custom default error message', () => {
        const customMessage = 'Custom domain validation error';
        const customSchema = createDomainCreateSchema({}, customMessage);
        const result = customSchema.safeParse({ domain_url: '' });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });

      it('should use field-level error message over default', () => {
        const fieldErrorMessage = 'Field-level error';
        const defaultErrorMessage = 'Default error';
        const customSchema = createDomainCreateSchema(
          { domainUrl: { errorMessage: fieldErrorMessage } },
          defaultErrorMessage,
        );
        const result = customSchema.safeParse({ domain_url: '' });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(fieldErrorMessage);
        }
      });
    });

    describe('with custom regex', () => {
      it('should accept domains matching the custom regex', () => {
        // Only allow .auth0.com domains
        const customRegex = /^[\w-]+\.auth0\.com$/;
        const customSchema = createDomainCreateSchema({
          domainUrl: {
            regex: customRegex,
            errorMessage: 'Only .auth0.com domains are allowed',
          },
        });

        expect(customSchema.safeParse({ domain_url: 'tenant.auth0.com' }).success).toBe(true);
        expect(customSchema.safeParse({ domain_url: 'my-app.auth0.com' }).success).toBe(true);
      });

      it('should reject domains not matching the custom regex', () => {
        // Only allow .auth0.com domains
        const customRegex = /^[\w-]+\.auth0\.com$/;
        const customSchema = createDomainCreateSchema({
          domainUrl: {
            regex: customRegex,
            errorMessage: 'Only .auth0.com domains are allowed',
          },
        });

        expect(customSchema.safeParse({ domain_url: 'example.com' }).success).toBe(false);
        expect(customSchema.safeParse({ domain_url: 'tenant.okta.com' }).success).toBe(false);
      });

      it('should use custom error message with custom regex validation failure', () => {
        const customRegex = /^[\w-]+\.auth0\.com$/;
        const customErrorMessage = 'Only .auth0.com domains are allowed';
        const customSchema = createDomainCreateSchema({
          domainUrl: {
            regex: customRegex,
            errorMessage: customErrorMessage,
          },
        });
        const result = customSchema.safeParse({ domain_url: 'example.com' });

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customErrorMessage);
        }
      });
    });

    describe('with empty options', () => {
      it('should behave like the default schema', () => {
        const schemaWithEmptyOptions = createDomainCreateSchema({});

        expect(schemaWithEmptyOptions.safeParse({ domain_url: 'example.com' }).success).toBe(true);
        expect(schemaWithEmptyOptions.safeParse({ domain_url: '' }).success).toBe(false);
      });
    });

    describe('with undefined options', () => {
      it('should behave like the default schema', () => {
        const schemaWithUndefinedOptions = createDomainCreateSchema(undefined);

        expect(schemaWithUndefinedOptions.safeParse({ domain_url: 'example.com' }).success).toBe(
          true,
        );
        expect(schemaWithUndefinedOptions.safeParse({ domain_url: '' }).success).toBe(false);
      });
    });
  });

  describe('type inference', () => {
    it('should correctly infer the form values type', () => {
      const validData: InternalDomainCreateFormValues = {
        domain_url: 'example.com',
      };
      const result = domainCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.domain_url).toBe('example.com');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle domain with special query parameters', () => {
      const result = domainCreateSchema.safeParse({
        domain_url: 'example.com/path?foo=bar&baz=qux',
      });
      expect(result.success).toBe(true);
    });

    it('should handle domain with encoded characters in path', () => {
      const result = domainCreateSchema.safeParse({
        domain_url: 'example.com/path%20with%20spaces',
      });
      expect(result.success).toBe(true);
    });

    it('should handle internationalized domain-like patterns', () => {
      // Note: actual IDN support depends on the regex implementation
      const result = domainCreateSchema.safeParse({
        domain_url: 'example-site.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing domain_url field', () => {
      const result = domainCreateSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null domain_url', () => {
      const result = domainCreateSchema.safeParse({ domain_url: null });
      expect(result.success).toBe(false);
    });

    it('should reject undefined domain_url', () => {
      const result = domainCreateSchema.safeParse({ domain_url: undefined });
      expect(result.success).toBe(false);
    });

    it('should reject non-string domain_url', () => {
      const result = domainCreateSchema.safeParse({ domain_url: 12345 });
      expect(result.success).toBe(false);
    });
  });
});
