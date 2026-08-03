import { describe, it, expect } from 'vitest';

import { mfaQueryKeys, mfaStepUpQueryKeys } from '../user-mfa-management-constants';

describe('mfaQueryKeys', () => {
  it('should have correct base key', () => {
    expect(mfaQueryKeys.all).toEqual(['mfa']);
  });

  it('should generate factors key with onlyActive param', () => {
    expect(mfaQueryKeys.factors(true)).toEqual(['mfa', 'factors', { onlyActive: true }]);
    expect(mfaQueryKeys.factors(false)).toEqual(['mfa', 'factors', { onlyActive: false }]);
  });
});

describe('mfaStepUpQueryKeys', () => {
  it('should have correct base key', () => {
    expect(mfaStepUpQueryKeys.all).toEqual(['mfa-step-up']);
  });

  it('should generate enrollment factors key scoped to token', () => {
    const token = 'test-mfa-token-123';
    expect(mfaStepUpQueryKeys.enrollmentFactors(token)).toEqual([
      'mfa-step-up',
      'enrollment-factors',
      'test-mfa-token-123',
    ]);
  });

  it('should generate authenticators key scoped to token', () => {
    const token = 'test-mfa-token-456';
    expect(mfaStepUpQueryKeys.authenticators(token)).toEqual([
      'mfa-step-up',
      'authenticators',
      'test-mfa-token-456',
    ]);
  });

  it('should produce distinct keys for different tokens', () => {
    const key1 = mfaStepUpQueryKeys.enrollmentFactors('token-a');
    const key2 = mfaStepUpQueryKeys.enrollmentFactors('token-b');
    expect(key1).not.toEqual(key2);
  });
});
