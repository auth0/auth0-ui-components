import { describe, it, expect, vi, beforeEach } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import {
  MAX_ROLES_PER_REQUEST,
  MAX_ROLES_PER_MEMBER,
} from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  canMutateMember,
  getInitials,
  getInvitationStatus,
  getMemberDisplayName,
  getRelativeLastLoginLabel,
  validateMemberRoleLimit,
} from '@/lib/utils/my-organization/member-management/member-management-utils';
import { createMockMember } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: vi.fn(),
}));

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
