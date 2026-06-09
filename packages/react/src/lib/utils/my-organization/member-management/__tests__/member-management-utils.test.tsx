import { describe, it, expect, vi } from 'vitest';

import {
  MAX_ROLES_PER_ASSIGNMENT,
  MAX_ROLES_PER_MEMBER,
} from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  ROLE_ASSIGNMENT_ERROR_KEYS,
  getInitials,
  getInvitationStatus,
  getMemberDisplayName,
  getRelativeLastLoginLabel,
  validateRoleAssignment,
} from '@/lib/utils/my-organization/member-management/member-management-utils';
import { createMockMember } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

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

describe('validateRoleAssignment', () => {
  const makeRoles = (count: number, prefix = 'role'): { id: string; name: string }[] =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, name: `${prefix}-${i}` }));

  it('returns ok for an empty roleIds array', () => {
    expect(validateRoleAssignment({ roleIds: [], memberRoles: [] })).toEqual({ ok: true });
  });

  it('returns ok when assigning up to MAX_ROLES_PER_ASSIGNMENT roles', () => {
    const roleIds = Array.from({ length: MAX_ROLES_PER_ASSIGNMENT }, (_, i) => `r-${i}`);
    expect(validateRoleAssignment({ roleIds, memberRoles: [] })).toEqual({ ok: true });
  });

  it('returns too_many_per_assignment when roleIds exceeds MAX_ROLES_PER_ASSIGNMENT', () => {
    const roleIds = Array.from({ length: MAX_ROLES_PER_ASSIGNMENT + 1 }, (_, i) => `r-${i}`);
    expect(validateRoleAssignment({ roleIds, memberRoles: [] })).toEqual({
      ok: false,
      reason: 'too_many_per_assignment',
    });
  });

  it('checks per-assignment limit before per-member limit', () => {
    // Both limits would be exceeded; per-assignment should win.
    const roleIds = Array.from({ length: MAX_ROLES_PER_ASSIGNMENT + 1 }, (_, i) => `new-${i}`);
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER, 'existing') as never;
    expect(validateRoleAssignment({ roleIds, memberRoles })).toEqual({
      ok: false,
      reason: 'too_many_per_assignment',
    });
  });

  it('returns ok when total stays at the per-member limit', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER - 1, 'existing') as never;
    const roleIds = ['new-1'];
    expect(validateRoleAssignment({ roleIds, memberRoles })).toEqual({ ok: true });
  });

  it('returns member_limit_exceeded when adding new roles would exceed MAX_ROLES_PER_MEMBER', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER, 'existing') as never;
    const roleIds = ['new-1'];
    expect(validateRoleAssignment({ roleIds, memberRoles })).toEqual({
      ok: false,
      reason: 'member_limit_exceeded',
    });
  });

  it('ignores role ids the member already holds when counting against the per-member limit', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER, 'existing') as never;
    // Re-assigning an existing role should NOT trip the limit.
    const roleIds = ['existing-0', 'existing-1'];
    expect(validateRoleAssignment({ roleIds, memberRoles })).toEqual({ ok: true });
  });

  it('counts only the new (non-duplicate) role ids when checking the per-member limit', () => {
    const memberRoles = makeRoles(MAX_ROLES_PER_MEMBER - 1, 'existing') as never;
    // 1 duplicate + 1 new = +1 net, which fits exactly.
    expect(validateRoleAssignment({ roleIds: ['existing-0', 'new-1'], memberRoles })).toEqual({
      ok: true,
    });
    // 1 duplicate + 2 new = +2 net, which exceeds the limit by 1.
    expect(
      validateRoleAssignment({
        roleIds: ['existing-0', 'new-1', 'new-2'],
        memberRoles,
      }),
    ).toEqual({ ok: false, reason: 'member_limit_exceeded' });
  });
});

describe('ROLE_ASSIGNMENT_ERROR_KEYS', () => {
  it('maps every validation failure reason to a non-empty i18n key', () => {
    expect(ROLE_ASSIGNMENT_ERROR_KEYS.too_many_per_assignment).toBe(
      'member.error.too_many_roles_per_assignment',
    );
    expect(ROLE_ASSIGNMENT_ERROR_KEYS.member_limit_exceeded).toBe(
      'member.error.member_role_limit_exceeded',
    );
  });
});
