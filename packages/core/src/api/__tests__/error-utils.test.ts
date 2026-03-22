import { describe, it, expect } from 'vitest';

import { isNotifiableError, resolveErrorMessage } from '../error-utils';

describe('isNotifiableError', () => {
  describe('falsy errors', () => {
    it.each([
      { value: null, description: 'null' },
      { value: undefined, description: 'undefined' },
      { value: false, description: 'false' },
      { value: 0, description: '0' },
      { value: '', description: 'empty string' },
    ])('should return false for $description', ({ value }) => {
      expect(isNotifiableError(value)).toBe(false);
    });
  });

  describe('MFA step-up errors', () => {
    it('should return false for error with mfa_required error field', () => {
      expect(isNotifiableError({ error: 'mfa_required' })).toBe(false);
    });

    it('should return false for error with mfa_required code field', () => {
      expect(isNotifiableError({ code: 'mfa_required' })).toBe(false);
    });

    it('should return false for error with mfa_required nested in body', () => {
      expect(isNotifiableError({ body: { error: 'mfa_required' } })).toBe(false);
    });

    it('should return false for error with mfa_required code nested in body', () => {
      expect(isNotifiableError({ body: { code: 'mfa_required' } })).toBe(false);
    });
  });

  describe('5xx server errors', () => {
    it.each([500, 502, 503, 504, 599])('should return false for %i status', (status) => {
      expect(isNotifiableError({ status })).toBe(false);
    });

    it('should return false for 500 error via body.status', () => {
      expect(isNotifiableError({ body: { status: 500 } })).toBe(false);
    });

    it('should return false for 503 error via statusCode', () => {
      expect(isNotifiableError({ statusCode: 503 })).toBe(false);
    });
  });

  describe('notifiable errors', () => {
    it.each([400, 401, 403, 404, 409, 422, 429])('should return true for %i status', (status) => {
      expect(isNotifiableError({ status })).toBe(true);
    });

    it('should return true for a plain Error instance', () => {
      expect(isNotifiableError(new Error('Something went wrong'))).toBe(true);
    });

    it('should return true for a string error', () => {
      expect(isNotifiableError('network error')).toBe(true);
    });

    it('should return true for an object without a status code', () => {
      expect(isNotifiableError({ message: 'unknown failure' })).toBe(true);
    });

    it('should return true for a plain truthy object with no status', () => {
      expect(isNotifiableError({})).toBe(true);
    });
  });
});

describe('resolveErrorMessage', () => {
  const FALLBACK = 'Something went wrong';

  describe('API error with body.detail', () => {
    it('should return body.detail when present', () => {
      const error = { body: { detail: 'Discovery failure: test.okta.com' } };
      expect(resolveErrorMessage(error, FALLBACK)).toBe('Discovery failure: test.okta.com');
    });

    it('should skip body.detail when it is an empty string and fall through to fallback', () => {
      const error = { body: { detail: '' } };
      expect(resolveErrorMessage(error, FALLBACK)).toBe(FALLBACK);
    });

    it('should prefer body.detail over error.message when both exist', () => {
      const error = { body: { detail: 'API detail message' }, message: 'Error message' };
      expect(resolveErrorMessage(error, FALLBACK)).toBe('API detail message');
    });
  });

  describe('Error instance', () => {
    it('should return error.message for a plain Error', () => {
      expect(resolveErrorMessage(new Error('Network timeout'), FALLBACK)).toBe('Network timeout');
    });

    it('should return error.message for a subclass of Error', () => {
      class CustomError extends Error {}
      expect(resolveErrorMessage(new CustomError('Custom failure'), FALLBACK)).toBe(
        'Custom failure',
      );
    });

    it('should return empty string when error.message is empty string', () => {
      expect(resolveErrorMessage(new Error(''), FALLBACK)).toBe('');
    });
  });

  describe('string error', () => {
    it('should return the string directly', () => {
      expect(resolveErrorMessage('quota exceeded', FALLBACK)).toBe('quota exceeded');
    });

    it('should return empty string for an empty string', () => {
      expect(resolveErrorMessage('', FALLBACK)).toBe('');
    });
  });

  describe('fallback', () => {
    it.each([
      { value: null, description: 'null' },
      { value: undefined, description: 'undefined' },
      { value: 123, description: 'number' },
      { value: true, description: 'boolean' },
      { value: [], description: 'array' },
      { value: {}, description: 'empty object' },
      { value: { body: {} }, description: 'API error without detail' },
      { value: { body: { status: 400 } }, description: 'API error with status but no detail' },
    ])('should return fallback for $description', ({ value }) => {
      expect(resolveErrorMessage(value, FALLBACK)).toBe(FALLBACK);
    });
  });
});
