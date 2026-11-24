import { describe, expect, it } from 'vitest';

import {
  createMfaStepUpError,
  getFatalErrorCode,
  isMfaStepUpError,
  isUnavailableError,
} from '../mfa-step-up-errors';

describe('isMfaStepUpError', () => {
  it('knows the failures of a step-up', () => {
    expect(isMfaStepUpError(createMfaStepUpError('unavailable'))).toBe(true);
  });

  it.each([
    ['another error with a code', Object.assign(new Error('x'), { code: 'unavailable' })],
    ['a plain error', new Error('x')],
    ['an object that looks like one', { name: 'MfaStepUpError', code: 'cancelled' }],
    ['nothing', undefined],
  ])('is false for %s', (_name, value) => {
    expect(isMfaStepUpError(value)).toBe(false);
  });
});

describe('createMfaStepUpError', () => {
  it('is an Error that carries its code', () => {
    const error = createMfaStepUpError('cancelled');

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('cancelled');
  });

  it('keeps the error that caused it', () => {
    const cause = new Error('boom');

    expect(createMfaStepUpError('unexpected', { cause }).cause).toBe(cause);
  });

  it('uses the code as the message unless given another', () => {
    expect(createMfaStepUpError('max_challenges_exceeded').message).toBe('max_challenges_exceeded');
    expect(createMfaStepUpError('unexpected', { message: 'custom' }).message).toBe('custom');
  });
});

describe('getFatalErrorCode', () => {
  it.each([
    ['a 429', { status: 429 }, 'rate_limited'],
    ['expired_token', { error: 'expired_token' }, 'token_expired'],
    ['expired_token inside data', { data: { error: 'expired_token' } }, 'token_expired'],
    ['mfa_token_expired', { error: 'mfa_token_expired' }, 'token_expired'],
    ['the SDK no longer knowing the token', { error: 'mfa_context_not_found' }, 'token_expired'],
    ['invalid_token', { error: 'invalid_token' }, 'token_invalid'],
    [
      'mfa_token_invalid, from the proxy',
      { status: 401, error: 'mfa_token_invalid' },
      'token_invalid',
    ],
    [
      'invalid_grant that says the token expired',
      { data: { error: 'invalid_grant', error_description: 'The mfa_token has expired' } },
      'token_expired',
    ],
    [
      'invalid_grant that complains about the token',
      { data: { error: 'invalid_grant', error_description: 'Malformed mfa_token' } },
      'token_invalid',
    ],
  ])('turns %s into %s', (_name, raw, code) => {
    expect(getFatalErrorCode(raw)).toBe(code);
  });

  it.each([
    [
      'a wrong code (invalid_grant about the code)',
      { data: { error: 'invalid_grant', error_description: 'Invalid otp_code.' } },
    ],
    ['a network error', new Error('network')],
    ['nothing', undefined],
  ])('leaves %s alone, so the user can try again', (_name, raw) => {
    expect(getFatalErrorCode(raw)).toBeUndefined();
  });
});

describe('isUnavailableError', () => {
  it.each([
    [
      'a proxy whose call to Auth0 failed',
      { status: 400, data: { error: 'unknown_error', error_description: 'fetch failed' } },
    ],
    ['unknown_error', { error: 'unknown_error' }],
    ['"fetch failed"', { error_description: 'fetch failed' }],
    ['a 500', { status: 500 }],
    ['a 503', { status: 503 }],
    ['a browser that could not reach the server', new TypeError('Failed to fetch')],
  ])('is true for %s', (_name, err) => {
    expect(isUnavailableError(err)).toBe(true);
  });

  it.each([
    [
      'a wrong code',
      { status: 403, data: { error: 'invalid_grant', error_description: 'Invalid otp_code.' } },
    ],
    ['a 429', { status: 429 }],
    ['an error without details', new Error('boom')],
    ['nothing', undefined],
  ])('is false for %s', (_name, err) => {
    expect(isUnavailableError(err)).toBe(false);
  });
});
