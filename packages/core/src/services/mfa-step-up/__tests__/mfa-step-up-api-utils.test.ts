import { describe, it, expect } from 'vitest';

import type { MfaRequiredError } from '../mfa-step-up-api-types';
import {
  getMfaToken,
  isMfaRequiredError,
  normalizeMfaRequiredError,
  normalizeFactorType,
  requiresContactInput,
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

describe('an axios error', () => {
  const axiosError = (data: unknown) => ({ isAxiosError: true, response: { status: 403, data } });
  const body = { error: 'mfa_required', mfa_token: 'tok', mfa_requirements: { challenge: [] } };

  it('is recognized by the body of its response', () => {
    expect(isMfaRequiredError(axiosError(body))).toBe(true);
    expect(isMfaRequiredError(axiosError({ error: 'forbidden' }))).toBe(false);
  });

  it('gives its token and requirements from the response body', () => {
    const normalized = normalizeMfaRequiredError(axiosError(body) as never) as unknown as {
      mfa_token: string;
      mfa_requirements: unknown;
    };

    expect(normalized.mfa_token).toBe('tok');
    expect(normalized.mfa_requirements).toEqual({ challenge: [] });
    expect(getMfaToken(axiosError(body))).toBe('tok');
  });
});

describe('getMfaToken', () => {
  it.each([
    ['the error itself', { error: 'mfa_required', mfa_token: 'tok' }],
    ['its body', { body: { error: 'mfa_required', mfa_token: 'tok' } }],
    ['its data', { data: { error: 'mfa_required', mfa_token: 'tok' } }],
  ])('reads the token from %s', (_name, err) => {
    expect(getMfaToken(err)).toBe('tok');
  });

  it.each([
    ['another error', new Error('boom')],
    ['an mfa_required error without a token', { error: 'mfa_required' }],
    ['nothing', undefined],
  ])('returns undefined for %s', (_name, err) => {
    expect(getMfaToken(err)).toBeUndefined();
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

describe('requiresContactInput', () => {
  it.each([
    ['sms', true],
    ['voice', true],
    ['email', true],
    ['otp', false],
    ['push', false],
    ['recovery-code', false],
    [undefined, false],
  ])('%s -> %s', (factor, expected) => {
    expect(requiresContactInput(factor)).toBe(expected);
  });
});

describe('an error whose body is in `data`', () => {
  const proxyError = {
    status: 403,
    data: { error: 'mfa_required', mfa_token: 'next-token', mfa_requirements: { enroll: [] } },
  };

  it('is recognised as mfa_required', () => {
    expect(isMfaRequiredError(proxyError)).toBe(true);
    expect(isMfaRequiredError({ status: 403, data: { error: 'invalid_grant' } })).toBe(false);
  });

  it('has its token and requirements lifted', () => {
    const normalized = normalizeMfaRequiredError(proxyError as unknown as MfaRequiredError);

    expect(normalized.mfa_token).toBe('next-token');
    expect(normalized.mfa_requirements).toEqual({ enroll: [] });
  });
});
