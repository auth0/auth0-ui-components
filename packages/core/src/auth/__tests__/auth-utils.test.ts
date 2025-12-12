import { describe, expect, it } from 'vitest';

import { AuthUtils } from '../auth-utils';

describe('auth-utils', () => {
  describe.each([
    {
      domain: 'https://example.auth0.com',
      expected: 'https://example.auth0.com/',
    },
    {
      domain: 'example.auth0.com',
      expected: 'https://example.auth0.com/',
    },
    {
      domain: 'http://localhost:3000',
      expected: 'http://localhost:3000/',
    },
  ])('toURL with domain', ({ domain, expected }) => {
    it('should convert to the expected URL format', () => {
      const result = AuthUtils.toURL(domain);
      expect(result).toBe(expected);
    });
  });
});
