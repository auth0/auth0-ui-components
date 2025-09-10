import { describe, it, expect } from 'vitest';

import { createEmailContactSchema } from './email-schema';
import { createSmsContactSchema } from './sms-schema';

describe('MFA Contact Schemas', () => {
  describe('Email Schema', () => {
    it('should validate valid email addresses', () => {
      const schema = createEmailContactSchema();
      expect(() => schema.parse({ contact: 'test@example.com' })).not.toThrow();
      expect(() => schema.parse({ contact: 'user.name+tag@domain.co.uk' })).not.toThrow();
    });

    it('should reject invalid email addresses', () => {
      const schema = createEmailContactSchema();
      expect(() => schema.parse({ contact: 'invalid-email' })).toThrow();
      expect(() => schema.parse({ contact: '@domain.com' })).toThrow();
      expect(() => schema.parse({ contact: 'user@' })).toThrow();
    });

    it('should use custom error message', () => {
      const customMessage = 'Custom email error';
      const schema = createEmailContactSchema(customMessage);
      try {
        schema.parse({ contact: 'invalid-email' });
      } catch (error: unknown) {
        expect((error as { errors: Array<{ message: string }> }).errors[0].message).toBe(
          customMessage,
        );
      }
    });
  });

  describe('SMS Schema', () => {
    it('should validate valid phone numbers', () => {
      const schema = createSmsContactSchema();
      expect(() => schema.parse({ contact: '+1234567890' })).not.toThrow();
      expect(() => schema.parse({ contact: '1234567890' })).not.toThrow();
      expect(() => schema.parse({ contact: '+1 (234) 567-8900' })).not.toThrow();
      expect(() => schema.parse({ contact: '+44 20 7946 0958' })).not.toThrow();
    });

    it('should reject invalid phone numbers', () => {
      const schema = createSmsContactSchema();
      expect(() => schema.parse({ contact: '123' })).toThrow(); // too short
      expect(() => schema.parse({ contact: 'abc123def' })).toThrow(); // letters
      expect(() => schema.parse({ contact: '' })).toThrow(); // empty
    });

    it('should use custom error message', () => {
      const customMessage = 'Custom phone error';
      const schema = createSmsContactSchema(customMessage);
      try {
        schema.parse({ contact: 'invalid' });
      } catch (error: unknown) {
        expect((error as { errors: Array<{ message: string }> }).errors[0].message).toBe(
          customMessage,
        );
      }
    });
  });
});
