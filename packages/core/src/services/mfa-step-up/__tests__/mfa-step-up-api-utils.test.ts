import { describe, it, expect } from 'vitest';

import { isMfaRequiredError } from '../mfa-step-up-api-utils';

describe('isMfaRequiredError', () => {
  describe('returns false for non-object values', () => {
    it.each([null, undefined, 0, '', false])('returns false for %s', (value) => {
      expect(isMfaRequiredError(value)).toBe(false);
    });

    it.each(['mfa_required', 42, true])('returns false for primitive %s', (value) => {
      expect(isMfaRequiredError(value)).toBe(false);
    });
  });

  describe('direct error object', () => {
    it('returns true when error.error is mfa_required', () => {
      expect(isMfaRequiredError({ error: 'mfa_required' })).toBe(true);
    });

    it('returns true when error.code is mfa_required', () => {
      expect(isMfaRequiredError({ code: 'mfa_required' })).toBe(true);
    });

    it('returns false when error.error is a different value', () => {
      expect(isMfaRequiredError({ error: 'access_denied' })).toBe(false);
    });

    it('returns false for an empty object', () => {
      expect(isMfaRequiredError({})).toBe(false);
    });
  });

  describe('nested body object', () => {
    it('returns true when body.error is mfa_required', () => {
      expect(isMfaRequiredError({ body: { error: 'mfa_required' } })).toBe(true);
    });

    it('returns true when body.code is mfa_required', () => {
      expect(isMfaRequiredError({ body: { code: 'mfa_required' } })).toBe(true);
    });

    it('returns false when body.error is a different value', () => {
      expect(isMfaRequiredError({ body: { error: 'access_denied' } })).toBe(false);
    });

    it('returns false when body is null', () => {
      expect(isMfaRequiredError({ body: null })).toBe(false);
    });

    it('returns false when body is a string', () => {
      expect(isMfaRequiredError({ body: 'mfa_required' })).toBe(false);
    });

    it('returns false when body is an empty object', () => {
      expect(isMfaRequiredError({ body: {} })).toBe(false);
    });
  });
});
