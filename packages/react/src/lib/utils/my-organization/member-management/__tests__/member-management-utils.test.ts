import { describe, it, expect } from 'vitest';

import {
  getInitials,
  getInvitationStatus,
} from '@/lib/utils/my-organization/member-management/member-management-utils';

describe('getInvitationStatus', () => {
  it('returns expired when invitation has expired', () => {
    const expired = getInvitationStatus({ expires_at: '2000-01-01T00:00:00Z' } as never);
    expect(expired).toBe('expired');
  });

  it('returns pending when invitation has not expired', () => {
    const pending = getInvitationStatus({ expires_at: '2099-01-01T00:00:00Z' } as never);
    expect(pending).toBe('pending');
  });
});

describe('getInitials', () => {
  it('returns single uppercase letter for a single-word name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('returns first and last initials for a multi-word name', () => {
    expect(getInitials('Alice Wonderland')).toBe('AW');
  });

  it('uses first and last word for names with more than two parts', () => {
    expect(getInitials('Alice B Wonderland')).toBe('AW');
  });

  it('returns U when name is undefined', () => {
    expect(getInitials(undefined)).toBe('U');
  });

  it('returns U for an empty string', () => {
    expect(getInitials('')).toBe('U');
  });

  it('returns U for a whitespace-only string', () => {
    expect(getInitials('   ')).toBe('U');
  });
});
