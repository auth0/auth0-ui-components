import { describe, it, expect, vi, beforeEach } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import {
  MAX_ROLES_PER_REQUEST,
  MAX_ROLES_PER_MEMBER,
} from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  formatMemberCount,
  canMutateMember,
  getInitials,
  getInvitationStatus,
  getMemberDisplayName,
  getRelativeLastLoginLabel,
  hasEmailDelimiter,
  isValidUserId,
  splitEmailInput,
  validateMemberRoleLimit,
} from '@/lib/utils/my-organization/member-management/member-management-utils';
import { createMockMember } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: vi.fn(),
}));

describe('when validating user IDs', () => {
  it('returns false for undefined', () => {
    expect(isValidUserId(undefined)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidUserId(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidUserId('')).toBe(false);
  });

  it('returns false for userId without pipe separator', () => {
    expect(isValidUserId('auth0user123')).toBe(false);
  });

  it('returns true for valid userId with pipe separator', () => {
    expect(isValidUserId('auth0|user123')).toBe(true);
  });

  it('returns true for userId with multiple pipes', () => {
    expect(isValidUserId('auth0|user|123')).toBe(true);
  });

  it('returns false for userId exceeding 1024 characters', () => {
    const longId = `auth0|${'a'.repeat(1024)}`;
    expect(isValidUserId(longId)).toBe(false);
  });

  it('returns true for userId at exactly 1024 characters', () => {
    const exactId = `auth0|${'a'.repeat(1018)}`;
    expect(exactId.length).toBe(1024);
    expect(isValidUserId(exactId)).toBe(true);
  });
});

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

describe('getMemberDisplayName', () => {
  it('should prefer the member full name when given and family names are present', () => {
    expect(
      getMemberDisplayName(
        createMockMember({
          given_name: 'Ada',
          family_name: 'Lovelace',
          name: 'Ignored Name',
          email: 'ada@example.com',
        }),
      ),
    ).toBe('Ada Lovelace');
  });

  it('should fall back to the member name when full name is unavailable', () => {
    expect(
      getMemberDisplayName(
        createMockMember({
          given_name: undefined,
          family_name: undefined,
          name: 'Grace Hopper',
        }),
      ),
    ).toBe('Grace Hopper');
  });

  it('should fall back to email when no name fields are available', () => {
    expect(
      getMemberDisplayName(
        createMockMember({
          given_name: undefined,
          family_name: undefined,
          name: '',
          email: 'fallback@example.com',
        }),
      ),
    ).toBe('fallback@example.com');
  });
});

describe('getRelativeLastLoginLabel', () => {
  const mockT = ((_key: string, vars?: Record<string, unknown>, fallback?: string): string => {
    const template = fallback ?? '';
    if (!vars) return template;
    return template.replace(/\$\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
  }) as unknown as Parameters<typeof getRelativeLastLoginLabel>[1];

  it('should return Never for missing or invalid timestamps', () => {
    expect(getRelativeLastLoginLabel(undefined, mockT)).toBe('Never');
    expect(getRelativeLastLoginLabel('not-a-date', mockT)).toBe('Never');
  });

  it.each([
    {
      description: 'times under one minute',
      now: '2026-05-18T12:00:30.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: 'Just now',
    },
    {
      description: 'a single minute',
      now: '2026-05-18T12:01:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '1 minute ago',
    },
    {
      description: 'multiple minutes',
      now: '2026-05-18T12:45:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '45 minutes ago',
    },
    {
      description: 'a single hour',
      now: '2026-05-18T13:00:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '1 hour ago',
    },
    {
      description: 'multiple days',
      now: '2026-05-20T12:00:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '2 days ago',
    },
    {
      description: 'weeks',
      now: '2026-06-01T12:00:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '2 weeks ago',
    },
    {
      description: 'months',
      now: '2026-08-18T12:00:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '3 months ago',
    },
    {
      description: 'years',
      now: '2028-05-18T12:00:00.000Z',
      lastLogin: '2026-05-18T12:00:00.000Z',
      expected: '2 years ago',
    },
  ])('should format $description correctly', ({ now, lastLogin, expected }) => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date(now).getTime());

    expect(getRelativeLastLoginLabel(lastLogin, mockT)).toBe(expected);
  });
});

describe('formatMemberCount', () => {
  /** Substitutes `${count}` the way the core i18n service does. */
  const t = ((key: string, vars?: Record<string, unknown>) =>
    key === 'count_capped' ? `${String(vars?.count ?? '')}+` : key) as unknown as Parameters<
    typeof formatMemberCount
  >[2];

  it.each([undefined, false])('returns undefined when the total is not capped (%s)', (isCapped) => {
    expect(formatMemberCount(200, isCapped, t, 'en-US')).toBeUndefined();
  });

  it('returns undefined when the total is unavailable', () => {
    expect(formatMemberCount(undefined, true, t, 'en-US')).toBeUndefined();
  });

  it.each([
    { total: 1000, expected: '1,000+' },
    { total: 5000, expected: '5,000+' },
    { total: 0, expected: '0+' },
  ])('renders the capped total $total as $expected', ({ total, expected }) => {
    expect(formatMemberCount(total, true, t, 'en-US')).toBe(expected);
  });

  it('formats the capped total for the active locale', () => {
    // French groups thousands with a space rather than a comma.
    expect(formatMemberCount(5000, true, t, 'fr-FR')).toBe(`${(5000).toLocaleString('fr-FR')}+`);
    expect(formatMemberCount(5000, true, t, 'fr-FR')).not.toBe('5,000+');
  });
});

describe('validateMemberRoleLimit', () => {
  const t = ((key: string) => key) as never;
  const showToastMock = vi.mocked(showToast);

  const makeRoles = (count: number, prefix = 'role'): { id: string; name: string }[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, name: `${prefix}-${i}` }));

  beforeEach(() => {
    showToastMock.mockClear();
  });

  it('returns null for an empty roleIds array', () => {
    expect(validateMemberRoleLimit(t, [], [])).toBeNull();
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it('no longer caps the request size, which the UI now prevents', () => {
    const roleIds = Array.from({ length: MAX_ROLES_PER_REQUEST + 1 }, (_, i) => `r-${i}`);
    expect(validateMemberRoleLimit(t, roleIds, [])).toBeNull();
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it('returns null when the total lands exactly on MAX_ROLES_PER_MEMBER', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER - 1, 'existing') as never;
    expect(validateMemberRoleLimit(t, ['new-1'], memberRoles)).toBeNull();
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it('aborts with the per-member error when assignment would exceed MAX_ROLES_PER_MEMBER', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER, 'existing') as never;
    expect(validateMemberRoleLimit(t, ['new-1'], memberRoles)).toEqual({
      aborted: true,
    });
    expect(showToastMock).toHaveBeenCalledWith({
      type: 'error',
      message: 'member.error.member_role_limit_exceeded',
    });
  });

  it('ignores already-assigned role ids when counting against the per-member limit', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER, 'existing') as never;
    expect(validateMemberRoleLimit(t, ['existing-0', 'existing-1'], memberRoles)).toBeNull();
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it('treats a missing memberRoles list as zero existing roles', () => {
    expect(validateMemberRoleLimit(t, ['new-1'])).toBeNull();
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it('counts a repeated role id once, so the resulting total is what gets checked', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER - 1, 'existing') as never;
    expect(validateMemberRoleLimit(t, ['new-1', 'new-1'], memberRoles)).toBeNull();
    expect(showToastMock).not.toHaveBeenCalled();
  });
});

describe('canMutateMember', () => {
  it('returns true for full access_level', () => {
    expect(canMutateMember('full')).toBe(true);
  });

  it('returns true for limited access_level', () => {
    expect(canMutateMember('limited')).toBe(true);
  });

  it('returns false for readonly access_level', () => {
    expect(canMutateMember('readonly')).toBe(false);
  });

  it('returns false for none access_level', () => {
    expect(canMutateMember('none')).toBe(false);
  });

  it('returns false for undefined access_level', () => {
    expect(canMutateMember(undefined)).toBe(false);
  });

  it('returns false for empty string access_level', () => {
    expect(canMutateMember('')).toBe(false);
  });

  it('returns false for unknown access_level', () => {
    expect(canMutateMember('unknown')).toBe(false);
  });
});

describe('hasEmailDelimiter', () => {
  it('returns false for a partially typed address', () => {
    expect(hasEmailDelimiter('test1@email.co')).toBe(false);
  });

  it('returns true for a comma', () => {
    expect(hasEmailDelimiter('test1@email.com,')).toBe(true);
  });

  it('returns true for a space', () => {
    expect(hasEmailDelimiter('test1@email.com ')).toBe(true);
  });
});

describe('splitEmailInput', () => {
  it('completes an address on a comma', () => {
    expect(splitEmailInput('test1@email.com,')).toEqual({
      emails: ['test1@email.com'],
      remainder: '',
    });
  });

  it('completes an address on a space', () => {
    expect(splitEmailInput('test1@email.com ')).toEqual({
      emails: ['test1@email.com'],
      remainder: '',
    });
  });

  it('keeps the address still being typed as the remainder', () => {
    expect(splitEmailInput('test1@email.com,test2@em')).toEqual({
      emails: ['test1@email.com'],
      remainder: 'test2@em',
    });
  });

  it('splits a pasted list on mixed delimiters', () => {
    expect(splitEmailInput('a@x.com, b@x.com c@x.com')).toEqual({
      emails: ['a@x.com', 'b@x.com'],
      remainder: 'c@x.com',
    });
  });

  it('drops delimiters that complete nothing', () => {
    expect(splitEmailInput(', ,')).toEqual({ emails: [], remainder: '' });
  });

  it('returns the whole value as the remainder when there is no delimiter', () => {
    expect(splitEmailInput('test1@email.com')).toEqual({
      emails: [],
      remainder: 'test1@email.com',
    });
  });

  it('preserves invalid entries so they can be flagged', () => {
    expect(splitEmailInput('not-an-email,a@x.com,')).toEqual({
      emails: ['not-an-email', 'a@x.com'],
      remainder: '',
    });
  });
});
