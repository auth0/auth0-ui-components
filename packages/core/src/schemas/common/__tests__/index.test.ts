import { describe, it, expect } from 'vitest';

import {
  createStringSchema,
  createLogoSchema,
  createDomainSchema,
  createBooleanSchema,
  createFieldSchema,
  DOMAIN_REGEX,
  COMMON_FIELD_CONFIGS,
} from '../index';

describe('Common Schemas', () => {
  describe('createStringSchema', () => {
    describe('with default options (required = true)', () => {
      const schema = createStringSchema();

      describe.each([
        { input: 'a', shouldPass: true, description: 'single character' },
        { input: 'hello', shouldPass: true, description: 'simple string' },
        { input: 'Hello World', shouldPass: true, description: 'string with space' },
        { input: '123', shouldPass: true, description: 'numeric string' },
        { input: 'special!@#$%', shouldPass: true, description: 'special characters' },
        { input: '日本語', shouldPass: true, description: 'unicode characters' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });

      describe.each([{ input: '', shouldPass: false, description: 'empty string' }])(
        'when input is "$input" ($description)',
        ({ input, shouldPass }) => {
          it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
            const result = schema.safeParse(input);
            expect(result.success).toBe(shouldPass);
          });
        },
      );

      it('should return default error message for empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Minimum 1 characters required');
        }
      });
    });

    describe('with required = false (optional)', () => {
      const schema = createStringSchema({ required: false });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept valid string', () => {
        const result = schema.safeParse('hello');
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });
    });

    describe('with minLength option', () => {
      const schema = createStringSchema({ minLength: 3 });

      describe.each([
        { input: 'abc', shouldPass: true, description: 'exactly minLength' },
        { input: 'abcd', shouldPass: true, description: 'above minLength' },
        { input: 'ab', shouldPass: false, description: 'below minLength' },
        { input: 'a', shouldPass: false, description: 'single char' },
        { input: '', shouldPass: false, description: 'empty string' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should show minLength in error message', () => {
        const result = schema.safeParse('ab');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Minimum 3 characters required');
        }
      });
    });

    describe('with maxLength option', () => {
      const schema = createStringSchema({ minLength: 1, maxLength: 5 });

      describe.each([
        { input: 'a', shouldPass: true, description: 'single char' },
        { input: 'abcde', shouldPass: true, description: 'exactly maxLength' },
        { input: 'abcdef', shouldPass: false, description: 'above maxLength' },
        { input: 'abcdefghij', shouldPass: false, description: 'well above maxLength' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should show maxLength in error message', () => {
        const result = schema.safeParse('abcdef');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Maximum 5 characters allowed');
        }
      });
    });

    describe('with regex option', () => {
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      const schema = createStringSchema({ regex: alphanumericRegex });

      describe.each([
        { input: 'abc', shouldPass: true, description: 'lowercase letters' },
        { input: 'ABC', shouldPass: true, description: 'uppercase letters' },
        { input: '123', shouldPass: true, description: 'numbers' },
        { input: 'abc123', shouldPass: true, description: 'alphanumeric' },
        { input: 'abc-123', shouldPass: false, description: 'with hyphen' },
        { input: 'abc 123', shouldPass: false, description: 'with space' },
        { input: 'abc!@#', shouldPass: false, description: 'with special chars' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should return default regex error message', () => {
        const result = schema.safeParse('abc-123');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Invalid format');
        }
      });
    });

    describe('with custom errorMessage', () => {
      const customMessage = 'Custom validation error';
      const schema = createStringSchema({ errorMessage: customMessage });

      it('should use custom error message for empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });

    describe('with regex and custom errorMessage', () => {
      const customMessage = 'Only alphanumeric allowed';
      const schema = createStringSchema({
        regex: /^[a-zA-Z0-9]+$/,
        errorMessage: customMessage,
      });

      it('should use custom error message for regex failure', () => {
        const result = schema.safeParse('abc-123');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });

    describe('optional with minLength', () => {
      const schema = createStringSchema({ required: false, minLength: 3 });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });

      it('should accept string meeting minLength', () => {
        const result = schema.safeParse('abc');
        expect(result.success).toBe(true);
      });

      it('should reject string below minLength', () => {
        const result = schema.safeParse('ab');
        expect(result.success).toBe(false);
      });
    });

    describe('optional with maxLength', () => {
      const schema = createStringSchema({ required: false, maxLength: 5 });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept string within maxLength', () => {
        const result = schema.safeParse('abcde');
        expect(result.success).toBe(true);
      });

      it('should reject string exceeding maxLength', () => {
        const result = schema.safeParse('abcdef');
        expect(result.success).toBe(false);
      });
    });

    describe('optional with regex', () => {
      const schema = createStringSchema({ required: false, regex: /^[a-z]+$/ });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });

      it('should accept string matching regex', () => {
        const result = schema.safeParse('abc');
        expect(result.success).toBe(true);
      });

      it('should reject string not matching regex', () => {
        const result = schema.safeParse('ABC');
        expect(result.success).toBe(false);
      });
    });

    describe('combined options (minLength, maxLength, regex)', () => {
      const schema = createStringSchema({
        minLength: 2,
        maxLength: 10,
        regex: /^[a-z]+$/,
        errorMessage: 'Must be 2-10 lowercase letters',
      });

      describe.each([
        { input: 'ab', shouldPass: true, description: 'at minLength' },
        { input: 'abcdefghij', shouldPass: true, description: 'at maxLength' },
        { input: 'hello', shouldPass: true, description: 'valid length and pattern' },
        { input: 'a', shouldPass: false, description: 'below minLength' },
        { input: 'abcdefghijk', shouldPass: false, description: 'above maxLength' },
        { input: 'HELLO', shouldPass: false, description: 'wrong case' },
        { input: 'hello123', shouldPass: false, description: 'includes numbers' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });
    });
  });

  describe('createLogoSchema', () => {
    describe('with default options (optional)', () => {
      const schema = createLogoSchema();

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });

      describe.each([
        { input: 'https://example.com/logo.png', shouldPass: true, description: 'https URL' },
        { input: 'http://example.com/logo.png', shouldPass: true, description: 'http URL' },
        {
          input: 'https://cdn.example.com/images/logo.svg',
          shouldPass: true,
          description: 'nested path',
        },
        {
          input: 'https://example.com/logo?v=1',
          shouldPass: true,
          description: 'with query params',
        },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });

      describe.each([
        { input: 'ftp://example.com/logo.png', shouldPass: false, description: 'ftp protocol' },
        { input: 'example.com/logo.png', shouldPass: false, description: 'no protocol' },
        { input: 'not-a-url', shouldPass: false, description: 'invalid URL' },
        { input: 'file:///path/to/logo.png', shouldPass: false, description: 'file protocol' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });
    });

    describe('with required = true', () => {
      const schema = createLogoSchema({ required: true });

      it('should reject empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });

      it('should accept valid URL', () => {
        const result = schema.safeParse('https://example.com/logo.png');
        expect(result.success).toBe(true);
      });

      it('should return default error message', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Please enter a valid HTTP');
        }
      });
    });

    describe('with custom regex', () => {
      const pngOnlyRegex = /^https:\/\/.+\.png$/;
      const schema = createLogoSchema({ regex: pngOnlyRegex });

      it('should accept PNG URLs', () => {
        const result = schema.safeParse('https://example.com/logo.png');
        expect(result.success).toBe(true);
      });

      it('should reject non-PNG URLs', () => {
        const result = schema.safeParse('https://example.com/logo.jpg');
        expect(result.success).toBe(false);
      });

      it('should accept empty for optional', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });
    });

    describe('with custom regex and required', () => {
      const pngOnlyRegex = /^https:\/\/.+\.png$/;
      const schema = createLogoSchema({ required: true, regex: pngOnlyRegex });

      it('should reject empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });

      it('should accept PNG URLs', () => {
        const result = schema.safeParse('https://example.com/logo.png');
        expect(result.success).toBe(true);
      });

      it('should reject non-PNG URLs', () => {
        const result = schema.safeParse('https://example.com/logo.jpg');
        expect(result.success).toBe(false);
      });
    });

    describe('with custom errorMessage', () => {
      const customMessage = 'Logo URL must be a valid image URL';
      const schema = createLogoSchema({ required: true, errorMessage: customMessage });

      it('should use custom error message', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });
  });

  describe('DOMAIN_REGEX', () => {
    describe.each([
      { input: 'example.com', shouldPass: true, description: 'simple domain' },
      { input: 'sub.example.com', shouldPass: true, description: 'subdomain' },
      { input: 'deep.sub.example.com', shouldPass: true, description: 'nested subdomain' },
      { input: 'https://example.com', shouldPass: true, description: 'https protocol' },
      { input: 'http://example.com', shouldPass: true, description: 'http protocol' },
      { input: 'example.com:8080', shouldPass: true, description: 'with port' },
      { input: 'example.com:443', shouldPass: true, description: 'with standard port' },
      { input: 'example.com/path', shouldPass: true, description: 'with path' },
      { input: 'example.com/path/to/resource', shouldPass: true, description: 'with nested path' },
      {
        input: 'example.com/path?query=value',
        shouldPass: true,
        description: 'with path and query',
      },
      { input: 'localhost', shouldPass: true, description: 'localhost' },
      { input: 'localhost:3000', shouldPass: true, description: 'localhost with port' },
      { input: 'my-domain.com', shouldPass: true, description: 'with hyphen' },
      { input: 'my_domain.com', shouldPass: true, description: 'with underscore' },
      { input: 'domain123.com', shouldPass: true, description: 'with numbers' },
      { input: '192.168.1.1', shouldPass: true, description: 'IP address' },
      { input: 'EXAMPLE.COM', shouldPass: true, description: 'uppercase' },
    ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'match' : 'not match'}`, () => {
        expect(DOMAIN_REGEX.test(input)).toBe(shouldPass);
      });
    });

    describe.each([
      { input: '', shouldPass: false, description: 'empty string' },
      { input: 'ftp://example.com', shouldPass: false, description: 'ftp protocol' },
      { input: '.com', shouldPass: false, description: 'missing domain name' },
      { input: 'example..com', shouldPass: false, description: 'double dots' },
    ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'match' : 'not match'}`, () => {
        expect(DOMAIN_REGEX.test(input)).toBe(shouldPass);
      });
    });
  });

  describe('createDomainSchema', () => {
    describe('with default options (required = true)', () => {
      const schema = createDomainSchema();

      describe.each([
        { input: 'example.com', shouldPass: true, description: 'simple domain' },
        { input: 'https://example.com', shouldPass: true, description: 'with https' },
        { input: 'localhost:3000', shouldPass: true, description: 'localhost with port' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });

      it('should reject empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });

      it('should return default error message', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(
            'Please enter a valid domain (e.g., example.com or https://example.com)',
          );
        }
      });
    });

    describe('with required = false', () => {
      const schema = createDomainSchema({ required: false });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });

      it('should accept valid domain', () => {
        const result = schema.safeParse('example.com');
        expect(result.success).toBe(true);
      });

      it('should reject invalid domain when provided', () => {
        const result = schema.safeParse('ftp://example.com');
        expect(result.success).toBe(false);
      });
    });

    describe('with custom regex', () => {
      const httpsOnlyRegex = /^https:\/\/.+$/;
      const schema = createDomainSchema({ regex: httpsOnlyRegex });

      it('should accept https URLs', () => {
        const result = schema.safeParse('https://example.com');
        expect(result.success).toBe(true);
      });

      it('should reject http URLs', () => {
        const result = schema.safeParse('http://example.com');
        expect(result.success).toBe(false);
      });

      it('should reject domains without protocol', () => {
        const result = schema.safeParse('example.com');
        expect(result.success).toBe(false);
      });
    });

    describe('with custom regex and optional', () => {
      const httpsOnlyRegex = /^https:\/\/.+$/;
      const schema = createDomainSchema({ required: false, regex: httpsOnlyRegex });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept empty string', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(true);
      });

      it('should accept https when provided', () => {
        const result = schema.safeParse('https://example.com');
        expect(result.success).toBe(true);
      });

      it('should reject http when provided', () => {
        const result = schema.safeParse('http://example.com');
        expect(result.success).toBe(false);
      });
    });

    describe('with custom errorMessage', () => {
      const customMessage = 'Enter a valid domain name';
      const schema = createDomainSchema({ errorMessage: customMessage });

      it('should use custom error message', () => {
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });
  });

  describe('createBooleanSchema', () => {
    describe('with default options (required)', () => {
      const schema = createBooleanSchema();

      it('should accept true', () => {
        const result = schema.safeParse(true);
        expect(result.success).toBe(true);
      });

      it('should accept false', () => {
        const result = schema.safeParse(false);
        expect(result.success).toBe(true);
      });

      describe.each([
        { input: 'true', description: 'string "true"' },
        { input: 'false', description: 'string "false"' },
        { input: 1, description: 'number 1' },
        { input: 0, description: 'number 0' },
        { input: null, description: 'null' },
        { input: undefined, description: 'undefined' },
        { input: {}, description: 'object' },
        { input: [], description: 'array' },
      ])('should reject $description', ({ input }) => {
        it('should reject', () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(false);
        });
      });

      it('should return default error message', () => {
        const result = schema.safeParse('not-boolean');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Invalid boolean value');
        }
      });
    });

    describe('with required = false', () => {
      const schema = createBooleanSchema({ required: false });

      it('should accept true', () => {
        const result = schema.safeParse(true);
        expect(result.success).toBe(true);
      });

      it('should accept false', () => {
        const result = schema.safeParse(false);
        expect(result.success).toBe(true);
      });

      it('should accept undefined', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should reject non-boolean values', () => {
        const result = schema.safeParse('true');
        expect(result.success).toBe(false);
      });
    });

    describe('with custom errorMessage', () => {
      const customMessage = 'Must be a boolean (true or false)';
      const schema = createBooleanSchema({ errorMessage: customMessage });

      it('should use custom error message', () => {
        const result = schema.safeParse('invalid');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });
    });
  });

  describe('COMMON_FIELD_CONFIGS', () => {
    it('should have domain config', () => {
      expect(COMMON_FIELD_CONFIGS.domain).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.domain.defaultError).toBe('Please enter a valid domain');
    });

    it('should have client_id config', () => {
      expect(COMMON_FIELD_CONFIGS.client_id).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.client_id.defaultError).toBe('Please enter a valid client ID');
    });

    it('should have client_secret config', () => {
      expect(COMMON_FIELD_CONFIGS.client_secret).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.client_secret.defaultError).toBe(
        'Please enter a valid client secret',
      );
    });

    it('should have icon_url config with regex', () => {
      expect(COMMON_FIELD_CONFIGS.icon_url).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.icon_url.defaultError).toBe('Please enter a valid URL');
      expect(COMMON_FIELD_CONFIGS.icon_url.regex).toBeInstanceOf(RegExp);
    });

    it('should have callback_url config with regex', () => {
      expect(COMMON_FIELD_CONFIGS.callback_url).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.callback_url.defaultError).toBe('Please enter a valid URL');
      expect(COMMON_FIELD_CONFIGS.callback_url.regex).toBeInstanceOf(RegExp);
    });

    it('should have url config with regex', () => {
      expect(COMMON_FIELD_CONFIGS.url).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.url.defaultError).toBe('Please enter a valid URL');
      expect(COMMON_FIELD_CONFIGS.url.regex).toBeInstanceOf(RegExp);
    });

    it('should have certificate config', () => {
      expect(COMMON_FIELD_CONFIGS.certificate).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.certificate.defaultError).toBe(
        'Please enter a valid certificate',
      );
    });

    it('should have algorithm config', () => {
      expect(COMMON_FIELD_CONFIGS.algorithm).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.algorithm.defaultError).toBe('Please enter a valid algorithm');
    });

    it('should have metadata config', () => {
      expect(COMMON_FIELD_CONFIGS.metadata).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.metadata.defaultError).toBe('Please enter valid metadata');
    });

    it('should have userIdAttribute config with regex', () => {
      expect(COMMON_FIELD_CONFIGS.userIdAttribute).toBeDefined();
      expect(COMMON_FIELD_CONFIGS.userIdAttribute.defaultError).toBe(
        'Please enter a valid user ID attribute',
      );
      expect(COMMON_FIELD_CONFIGS.userIdAttribute.regex).toBeInstanceOf(RegExp);
    });

    describe('icon_url regex validation', () => {
      const regex = COMMON_FIELD_CONFIGS.icon_url.regex!;

      describe.each([
        { input: 'https://example.com/icon.png', shouldPass: true },
        { input: 'http://example.com/icon.png', shouldPass: true },
        { input: 'https://cdn.example.com/images/icon.svg', shouldPass: true },
        { input: 'ftp://example.com/icon.png', shouldPass: false },
        { input: 'example.com/icon.png', shouldPass: false },
      ])('when input is "$input"', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'match' : 'not match'}`, () => {
          expect(regex.test(input)).toBe(shouldPass);
        });
      });
    });

    describe('userIdAttribute regex validation', () => {
      const regex = COMMON_FIELD_CONFIGS.userIdAttribute.regex!;

      describe.each([
        { input: 'userId', shouldPass: true, description: 'camelCase' },
        { input: 'user_id', shouldPass: true, description: 'snake_case' },
        { input: '_private', shouldPass: true, description: 'starts with underscore' },
        { input: 'User123', shouldPass: true, description: 'with numbers' },
        { input: 'CONSTANT', shouldPass: true, description: 'uppercase' },
        { input: '123user', shouldPass: false, description: 'starts with number' },
        { input: 'user-id', shouldPass: false, description: 'with hyphen' },
        { input: 'user.id', shouldPass: false, description: 'with dot' },
        { input: 'user id', shouldPass: false, description: 'with space' },
      ])('when input is "$input" ($description)', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'match' : 'not match'}`, () => {
          expect(regex.test(input)).toBe(shouldPass);
        });
      });
    });
  });

  describe('createFieldSchema', () => {
    describe('with domain field config', () => {
      const schema = createFieldSchema(COMMON_FIELD_CONFIGS.domain);

      it('should be optional by default', () => {
        const result = schema.safeParse(undefined);
        expect(result.success).toBe(true);
      });

      it('should accept valid string', () => {
        const result = schema.safeParse('example.com');
        expect(result.success).toBe(true);
      });
    });

    describe('with icon_url field config (has regex)', () => {
      const schema = createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, { required: true });

      it('should accept valid HTTP URLs', () => {
        const result = schema.safeParse('https://example.com/icon.png');
        expect(result.success).toBe(true);
      });

      it('should reject invalid URLs', () => {
        const result = schema.safeParse('example.com/icon.png');
        expect(result.success).toBe(false);
      });

      it('should use default error from config', () => {
        const result = schema.safeParse('invalid');
        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe('Please enter a valid URL');
        }
      });
    });

    describe('with userIdAttribute field config (has regex)', () => {
      const schema = createFieldSchema(COMMON_FIELD_CONFIGS.userIdAttribute, { required: true });

      describe.each([
        { input: 'userId', shouldPass: true },
        { input: 'user_id', shouldPass: true },
        { input: '123invalid', shouldPass: false },
        { input: 'user-id', shouldPass: false },
      ])('when input is "$input"', ({ input, shouldPass }) => {
        it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
          const result = schema.safeParse(input);
          expect(result.success).toBe(shouldPass);
        });
      });
    });

    describe('with custom options override', () => {
      it('should allow overriding required', () => {
        const schema = createFieldSchema(COMMON_FIELD_CONFIGS.domain, { required: true });
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });

      it('should allow overriding regex', () => {
        const customRegex = /^custom-.+$/;
        const schema = createFieldSchema(COMMON_FIELD_CONFIGS.domain, {
          required: true,
          regex: customRegex,
        });

        expect(schema.safeParse('custom-value').success).toBe(true);
        expect(schema.safeParse('other-value').success).toBe(false);
      });

      it('should allow overriding errorMessage', () => {
        const customError = 'Custom field error';
        const schema = createFieldSchema(COMMON_FIELD_CONFIGS.domain, {
          required: true,
          errorMessage: customError,
        });
        const result = schema.safeParse('');

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customError);
        }
      });

      it('should allow setting minLength', () => {
        const schema = createFieldSchema(COMMON_FIELD_CONFIGS.domain, {
          required: true,
          minLength: 5,
        });

        expect(schema.safeParse('abcde').success).toBe(true);
        expect(schema.safeParse('abcd').success).toBe(false);
      });

      it('should allow setting maxLength', () => {
        const schema = createFieldSchema(COMMON_FIELD_CONFIGS.domain, {
          required: true,
          minLength: 1,
          maxLength: 5,
        });

        expect(schema.safeParse('abcde').success).toBe(true);
        expect(schema.safeParse('abcdef').success).toBe(false);
      });
    });

    describe('with customError parameter', () => {
      it('should use customError over config defaultError', () => {
        const customError = 'Fallback custom error';
        const schema = createFieldSchema(
          COMMON_FIELD_CONFIGS.domain,
          { required: true },
          customError,
        );
        const result = schema.safeParse('');

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customError);
        }
      });

      it('should prefer options.errorMessage over customError', () => {
        const optionsError = 'Options error message';
        const customError = 'Fallback custom error';
        const schema = createFieldSchema(
          COMMON_FIELD_CONFIGS.domain,
          { required: true, errorMessage: optionsError },
          customError,
        );
        const result = schema.safeParse('');

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(optionsError);
        }
      });
    });
  });

  describe('Edge cases', () => {
    describe('createStringSchema edge cases', () => {
      it('should handle minLength of 0 as truthy required', () => {
        const schema = createStringSchema({ minLength: 0 });
        // minLength 0 means use default 1 when required
        const result = schema.safeParse('');
        expect(result.success).toBe(false);
      });

      it('should handle very large maxLength', () => {
        const schema = createStringSchema({ maxLength: 1000000 });
        const result = schema.safeParse('a'.repeat(1000000));
        expect(result.success).toBe(true);
      });
    });

    describe('createLogoSchema edge cases', () => {
      it('should handle URL with special characters in path', () => {
        const schema = createLogoSchema();
        const result = schema.safeParse('https://example.com/logo%20image.png');
        expect(result.success).toBe(true);
      });

      it('should handle URL with unicode in path', () => {
        const schema = createLogoSchema();
        const result = schema.safeParse('https://example.com/日本語.png');
        expect(result.success).toBe(true);
      });
    });

    describe('createDomainSchema edge cases', () => {
      it('should handle IP addresses', () => {
        const schema = createDomainSchema();
        const result = schema.safeParse('192.168.1.1');
        expect(result.success).toBe(true);
      });

      it('should handle IP with port', () => {
        const schema = createDomainSchema();
        const result = schema.safeParse('192.168.1.1:8080');
        expect(result.success).toBe(true);
      });
    });
  });
});
