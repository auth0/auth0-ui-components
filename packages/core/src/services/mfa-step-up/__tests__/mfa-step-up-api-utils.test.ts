import { describe, it, expect } from 'vitest';

import type { MfaRequiredError } from '../mfa-step-up-api-types';
import {
  isMfaRequiredError,
  normalizeMfaRequiredError,
  normalizeFactorType,
} from '../mfa-step-up-api-utils';

describe('isMfaRequiredError', () => {
  describe('returns false for non-object values', () => {
    it.each([null, undefined, 0, '', false, 'mfa_required', 42, true])(
      'returns false for %s',
      (value) => {
        expect(isMfaRequiredError(value)).toBe(false);
      },
    );
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

describe('normalizeMfaRequiredError', () => {
  it('returns the error as-is when mfa_token is at the top level', () => {
    const error = { error: 'mfa_required', mfa_token: 'token123' } as unknown as MfaRequiredError;
    expect(normalizeMfaRequiredError(error).mfa_token).toBe('token123');
  });

  it('lifts mfa_token from body when missing at top level', () => {
    const error = {
      error: 'mfa_required',
      body: { mfa_token: 'bodytoken' },
    } as unknown as MfaRequiredError;
    expect(normalizeMfaRequiredError(error).mfa_token).toBe('bodytoken');
  });

  it('prefers top-level mfa_token over body mfa_token', () => {
    const error = {
      error: 'mfa_required',
      mfa_token: 'top',
      body: { mfa_token: 'body' },
    } as unknown as MfaRequiredError;
    expect(normalizeMfaRequiredError(error).mfa_token).toBe('top');
  });

  it('lifts mfa_requirements from body when missing at top level', () => {
    const requirements = { enroll: [], challenge: [] };
    const error = {
      error: 'mfa_required',
      mfa_token: '',
      error_description: '',
      body: { mfa_requirements: requirements },
    } as unknown as MfaRequiredError;
    expect(normalizeMfaRequiredError(error).mfa_requirements).toBe(requirements);
  });
});

describe('normalizeFactorType', () => {
  it('maps phone to sms', () => {
    expect(normalizeFactorType('phone')).toBe('sms');
  });

  it('maps push-notification to push', () => {
    expect(normalizeFactorType('push-notification')).toBe('push');
  });

  it('maps totp to otp', () => {
    expect(normalizeFactorType('totp')).toBe('otp');
  });

  it('returns the type as-is when no alias exists', () => {
    expect(normalizeFactorType('sms')).toBe('sms');
    expect(normalizeFactorType('voice')).toBe('voice');
    expect(normalizeFactorType('email')).toBe('email');
  });
});
