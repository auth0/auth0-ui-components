import { describe, it, expect } from 'vitest';

import { createEmailContactSchema } from '../email-schema';

describe('Email Schema', () => {
  const schema = createEmailContactSchema();

  describe.each([
    { input: 'test@example.com', shouldPass: true },
    { input: 'user.name+tag@domain.co.uk', shouldPass: true },
    { input: 'valid_email@subdomain.example.com', shouldPass: true },
    { input: 'invalid-email', shouldPass: false },
    { input: '@domain.com', shouldPass: false },
    { input: 'user@', shouldPass: false },
    { input: '', shouldPass: false },
  ])('when email: $input', ({ input, shouldPass }) => {
    it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
      const result = schema.safeParse({ contact: input });
      expect(result.success).toBe(shouldPass);
    });
  });
  describe('when using a custom error message', () => {
    it('should use it on validation failure', () => {
      const customMessage = 'Custom email error';
      const customSchema = createEmailContactSchema(customMessage);
      const result = customSchema.safeParse({ contact: 'invalid-email' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(customMessage);
      }
    });
  });

  describe('when using a custom regex pattern', () => {
    it('should accept emails matching the custom regex', () => {
      const customRegex = /^[a-z]+@test\.com$/;
      const customSchema = createEmailContactSchema('Custom error', customRegex);

      expect(customSchema.safeParse({ contact: 'valid@test.com' }).success).toBe(true);
    });

    it('should reject emails not matching the custom regex', () => {
      const customRegex = /^[a-z]+@test\.com$/;
      const customSchema = createEmailContactSchema('Custom error', customRegex);

      expect(customSchema.safeParse({ contact: 'Invalid@test.com' }).success).toBe(false);
    });
  });
});
