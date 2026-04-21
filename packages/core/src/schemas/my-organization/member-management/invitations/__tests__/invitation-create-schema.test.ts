import { describe, it, expect } from 'vitest';

import {
  createInvitationCreateSchema,
  invitationCreateSchemaDefaults,
} from '../invitation-create-schema';

describe('Invitation Create Schema', () => {
  describe('default schema', () => {
    describe.each([
      { input: 'user@example.com', shouldPass: true, description: 'simple email' },
      { input: 'test.user@domain.com', shouldPass: true, description: 'email with dots' },
      { input: 'user+tag@example.com', shouldPass: true, description: 'email with plus tag' },
      { input: 'user@sub.domain.com', shouldPass: true, description: 'email with subdomain' },
      { input: 'a@b.co', shouldPass: true, description: 'minimal valid email' },
      {
        input: 'user-name@example.org',
        shouldPass: true,
        description: 'email with hyphen in local',
      },
      {
        input: 'user_name@example.org',
        shouldPass: true,
        description: 'email with underscore in local',
      },
    ])('when email is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
        const result = invitationCreateSchemaDefaults.emailSchema.safeParse(input);
        expect(result.success).toBe(shouldPass);
      });
    });

    describe.each([
      { input: '', shouldPass: false, description: 'empty string' },
      { input: '   ', shouldPass: false, description: 'whitespace only' },
      { input: 'notanemail', shouldPass: false, description: 'missing @ and domain' },
      { input: '@example.com', shouldPass: false, description: 'missing local part' },
      { input: 'user@', shouldPass: false, description: 'missing domain' },
      { input: 'user@.com', shouldPass: false, description: 'missing domain name' },
      { input: 'user @example.com', shouldPass: false, description: 'space in local part' },
    ])('when email is "$input" ($description)', ({ input, shouldPass }) => {
      it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
        const result = invitationCreateSchemaDefaults.emailSchema.safeParse(input);
        expect(result.success).toBe(shouldPass);
      });
    });

    it('should return the default error message on validation failure', () => {
      const result = invitationCreateSchemaDefaults.emailSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success && result.error?.errors[0]) {
        expect(result.error.errors[0].message).toBe('Please enter a valid email address');
      }
    });

    it('should have default maxEmails of 10', () => {
      expect(invitationCreateSchemaDefaults.maxEmails).toBe(10);
    });

    it('should have default emailRegex', () => {
      expect(invitationCreateSchemaDefaults.emailRegex).toBeInstanceOf(RegExp);
      expect(invitationCreateSchemaDefaults.emailRegex.test('user@example.com')).toBe(true);
    });
  });

  describe('createInvitationCreateSchema factory', () => {
    describe('with custom error message', () => {
      it('should use custom default error message', () => {
        const customMessage = 'Custom email validation error';
        const schema = createInvitationCreateSchema({}, customMessage);
        const result = schema.emailSchema.safeParse('');

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customMessage);
        }
      });

      it('should use field-level error message over default', () => {
        const fieldError = 'Field-level error';
        const defaultError = 'Default error';
        const schema = createInvitationCreateSchema(
          { email: { errorMessage: fieldError } },
          defaultError,
        );
        const result = schema.emailSchema.safeParse('invalid');

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(fieldError);
        }
      });
    });

    describe('with custom regex', () => {
      it('should accept emails matching the custom regex', () => {
        const customRegex = /^[\w.+-]+@auth0\.com$/;
        const schema = createInvitationCreateSchema({
          email: {
            regex: customRegex,
            errorMessage: 'Only @auth0.com emails allowed',
          },
        });

        expect(schema.emailSchema.safeParse('user@auth0.com').success).toBe(true);
        expect(schema.emailSchema.safeParse('test.user@auth0.com').success).toBe(true);
      });

      it('should reject emails not matching the custom regex', () => {
        const customRegex = /^[\w.+-]+@auth0\.com$/;
        const schema = createInvitationCreateSchema({
          email: {
            regex: customRegex,
            errorMessage: 'Only @auth0.com emails allowed',
          },
        });

        expect(schema.emailSchema.safeParse('user@example.com').success).toBe(false);
        expect(schema.emailSchema.safeParse('user@gmail.com').success).toBe(false);
      });

      it('should use custom error message with custom regex validation failure', () => {
        const customRegex = /^[\w.+-]+@auth0\.com$/;
        const customErrorMessage = 'Only @auth0.com emails allowed';
        const schema = createInvitationCreateSchema({
          email: {
            regex: customRegex,
            errorMessage: customErrorMessage,
          },
        });
        const result = schema.emailSchema.safeParse('user@example.com');

        expect(result.success).toBe(false);
        if (!result.success && result.error?.errors[0]) {
          expect(result.error.errors[0].message).toBe(customErrorMessage);
        }
      });
    });

    describe('with custom maxEmails', () => {
      it('should override the default maxEmails', () => {
        const schema = createInvitationCreateSchema({ maxEmails: 5 });
        expect(schema.maxEmails).toBe(5);
      });

      it('should allow maxEmails of 1', () => {
        const schema = createInvitationCreateSchema({ maxEmails: 1 });
        expect(schema.maxEmails).toBe(1);
      });

      it('should default to 10 when maxEmails is not provided', () => {
        const schema = createInvitationCreateSchema({});
        expect(schema.maxEmails).toBe(10);
      });
    });

    describe('with empty options', () => {
      it('should behave like the default schema', () => {
        const schema = createInvitationCreateSchema({});

        expect(schema.emailSchema.safeParse('user@example.com').success).toBe(true);
        expect(schema.emailSchema.safeParse('').success).toBe(false);
        expect(schema.maxEmails).toBe(10);
      });
    });

    describe('with undefined options', () => {
      it('should behave like the default schema', () => {
        const schema = createInvitationCreateSchema(undefined);

        expect(schema.emailSchema.safeParse('user@example.com').success).toBe(true);
        expect(schema.emailSchema.safeParse('').success).toBe(false);
        expect(schema.maxEmails).toBe(10);
      });
    });

    describe('with no arguments', () => {
      it('should return defaults', () => {
        const schema = createInvitationCreateSchema();

        expect(schema.emailSchema.safeParse('user@example.com').success).toBe(true);
        expect(schema.emailSchema.safeParse('').success).toBe(false);
        expect(schema.maxEmails).toBe(10);
        expect(schema.emailErrorMessage).toBe('Please enter a valid email address');
      });
    });
  });

  describe('return value structure', () => {
    it('should return emailSchema, emailRegex, emailErrorMessage, and maxEmails', () => {
      const result = createInvitationCreateSchema();

      expect(result).toHaveProperty('emailSchema');
      expect(result).toHaveProperty('emailRegex');
      expect(result).toHaveProperty('emailErrorMessage');
      expect(result).toHaveProperty('maxEmails');
    });

    it('should return a Zod schema for emailSchema', () => {
      const result = createInvitationCreateSchema();
      expect(result.emailSchema.safeParse).toBeDefined();
      expect(typeof result.emailSchema.safeParse).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle email field config with only regex (no errorMessage)', () => {
      const schema = createInvitationCreateSchema({
        email: { regex: /^[\w.+-]+@company\.com$/ },
      });

      // Should use the default error message since none was provided
      expect(schema.emailErrorMessage).toBe('Please enter a valid email address');
    });

    it('should handle email field config with only errorMessage (no regex)', () => {
      const schema = createInvitationCreateSchema({
        email: { errorMessage: 'Custom error' },
      });

      // Should still use the default regex
      expect(schema.emailSchema.safeParse('user@example.com').success).toBe(true);
      expect(schema.emailErrorMessage).toBe('Custom error');
    });
  });
});
