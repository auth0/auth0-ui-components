import { describe, it, expect } from 'vitest';

import { createSmsContactSchema } from '../sms-schema';

describe('SMS Schema', () => {
  const schema = createSmsContactSchema();

  describe.each([
    { input: '+1234567890', shouldPass: true },
    { input: '1234567890', shouldPass: true },
    { input: '+1 (234) 567-8900', shouldPass: true },
    { input: '+44 20 7946 0958', shouldPass: true },
    { input: '123', shouldPass: false, reason: 'too short' },
    { input: 'abc123def', shouldPass: false, reason: 'contains letters' },
    { input: '', shouldPass: false, reason: 'empty' },
  ])('when phone: $input', ({ input, shouldPass }) => {
    it(`should ${shouldPass ? 'accept' : 'reject'}`, () => {
      const result = schema.safeParse({ contact: input });
      expect(result.success).toBe(shouldPass);
    });
  });

  describe('when using a custom error message', () => {
    it('should use it on validation failure', () => {
      const customMessage = 'Custom phone error';
      const customSchema = createSmsContactSchema(customMessage);
      const result = customSchema.safeParse({ contact: 'invalid' });

      expect(result.success).toBe(false);
      if (!result.success && result.error && result.error.errors[0]) {
        expect(result.error.errors[0].message).toBe(customMessage);
      }
    });
  });
});
