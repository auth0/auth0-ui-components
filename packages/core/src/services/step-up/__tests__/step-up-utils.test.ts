import { describe, it, expect } from 'vitest';

import { isMfaRequiredError } from '../step-up-utils';

describe('step-up-utils', () => {
  describe('isMfaRequiredError', () => {
    it('should return true for error with error="mfa_required" at root level', () => {
      const error = {
        error: 'mfa_required',
        error_description: 'MFA is required',
        mfa_token: 'token_123',
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return true for error with code="mfa_required" at root level', () => {
      const error = {
        code: 'mfa_required',
        error_description: 'MFA is required',
        mfa_token: 'token_123',
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return true for error with error="mfa_required" in body', () => {
      const error = {
        status: 403,
        body: {
          error: 'mfa_required',
          error_description: 'MFA is required',
          mfa_token: 'token_123',
        },
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return true for error with code="mfa_required" in body', () => {
      const error = {
        status: 403,
        body: {
          code: 'mfa_required',
          error_description: 'MFA is required',
          mfa_token: 'token_123',
        },
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isMfaRequiredError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isMfaRequiredError(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isMfaRequiredError('mfa_required')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isMfaRequiredError(403)).toBe(false);
    });

    it('should return false for boolean', () => {
      expect(isMfaRequiredError(true)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isMfaRequiredError({})).toBe(false);
    });

    it('should return false for object with different error', () => {
      const error = {
        error: 'access_denied',
        error_description: 'Access denied',
      };

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should return false for object with different code', () => {
      const error = {
        code: 'access_denied',
        error_description: 'Access denied',
      };

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should return false for object with body but different error', () => {
      const error = {
        status: 403,
        body: {
          error: 'access_denied',
          error_description: 'Access denied',
        },
      };

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should return false for object with body but different code', () => {
      const error = {
        status: 403,
        body: {
          code: 'access_denied',
          error_description: 'Access denied',
        },
      };

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should return false for object with body as null', () => {
      const error = {
        status: 403,
        body: null,
      };

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should return false for object with body as string', () => {
      const error = {
        status: 403,
        body: 'Error message',
      };

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should handle Error instance with mfa_required properties', () => {
      const error = new Error('MFA required');
      Object.assign(error, {
        error: 'mfa_required',
        mfa_token: 'token_123',
      });

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should handle Error instance with mfa_required in body', () => {
      const error = new Error('MFA required');
      Object.assign(error, {
        body: {
          error: 'mfa_required',
          mfa_token: 'token_123',
        },
      });

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return false for Error instance without mfa_required', () => {
      const error = new Error('Some error');

      expect(isMfaRequiredError(error)).toBe(false);
    });

    it('should return true for error with mfa_requirements', () => {
      const error = {
        error: 'mfa_required',
        error_description: 'MFA is required',
        mfa_token: 'token_123',
        mfa_requirements: {
          enroll: [{ type: 'otp' }],
          challenge: [{ type: 'oob' }],
        },
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return true for error with only enroll in mfa_requirements', () => {
      const error = {
        error: 'mfa_required',
        error_description: 'MFA is required',
        mfa_token: 'token_123',
        mfa_requirements: {
          enroll: [{ type: 'otp' }],
        },
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });

    it('should return true for error with only challenge in mfa_requirements', () => {
      const error = {
        error: 'mfa_required',
        error_description: 'MFA is required',
        mfa_token: 'token_123',
        mfa_requirements: {
          challenge: [{ type: 'oob' }],
        },
      };

      expect(isMfaRequiredError(error)).toBe(true);
    });
  });
});
