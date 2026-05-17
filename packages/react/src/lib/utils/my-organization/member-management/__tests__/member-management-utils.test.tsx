import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getInvitationStatus,
  getMemberDisplayName,
  getMemberInitials,
  getRelativeLastLoginLabel,
  MemberAvatar,
} from '@/lib/utils/my-organization/member-management/member-management-utils';
import {
  createMockExpiredInvitation,
  createMockPendingInvitation,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { createMockMember } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('member-management-utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
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

    it('should fall back to email and then dash when no name fields are available', () => {
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

      expect(
        getMemberDisplayName(
          createMockMember({
            given_name: undefined,
            family_name: undefined,
            name: '',
            email: undefined,
          }),
        ),
      ).toBe('-');
    });
  });

  describe('getMemberInitials', () => {
    it('should build initials from given and family names', () => {
      expect(
        getMemberInitials(createMockMember({ given_name: 'Ada', family_name: 'Lovelace' })),
      ).toBe('AL');
    });

    it('should return a dash when there is no usable member identity text', () => {
      expect(
        getMemberInitials(
          createMockMember({
            given_name: undefined,
            family_name: undefined,
            name: '',
            email: undefined,
          }),
        ),
      ).toBe('-');
    });
  });

  describe('MemberAvatar', () => {
    it('should render initials fallback when no picture is available', () => {
      render(<MemberAvatar member={createMockMember({})} />);

      expect(screen.getByText('AL')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('getInvitationStatus', () => {
    it('should return pending for invitations that have not expired', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));

      expect(getInvitationStatus(createMockPendingInvitation())).toBe('pending');
    });

    it('should return expired for invitations whose expiry is in the past', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));

      expect(getInvitationStatus(createMockExpiredInvitation())).toBe('expired');
    });

    it('should default to pending when the invitation has no expiry date', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));

      expect(getInvitationStatus(createMockPendingInvitation({ expires_at: undefined }))).toBe(
        'pending',
      );
    });
  });

  describe('getRelativeLastLoginLabel', () => {
    it('should return Never for missing or invalid timestamps', () => {
      expect(getRelativeLastLoginLabel()).toBe('Never');
      expect(getRelativeLastLoginLabel('not-a-date')).toBe('Never');
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

      expect(getRelativeLastLoginLabel(lastLogin)).toBe(expected);
    });
  });
});
