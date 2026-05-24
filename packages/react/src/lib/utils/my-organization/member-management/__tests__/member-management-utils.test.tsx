import { describe, it, expect, vi } from 'vitest';

import {
  getInitials,
  getInvitationStatus,
  getMemberDisplayName,
  getRelativeLastLoginLabel,
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
