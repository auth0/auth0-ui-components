import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberTable } from '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table';
import {
  createMockMember,
  createMockMemberTableProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { VIEWER_MEMBER_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('OrganizationMemberTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render member details, roles, and relative last login text', () => {
      vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T12:00:00.000Z').getTime());

      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_1',
            given_name: 'Ada',
            family_name: 'Lovelace',
            email: 'ada@example.com',
            name: '',
            last_login: '2026-05-13T12:00:00.000Z',
            roles: [],
          }),
        ],
        pagination: {
          pageSize: 10,
          currentPage: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);
      expect(screen.getByText('member.table.columns.last_login')).toBeInTheDocument();
    });

    it('should render fallback values when member roles and last login are missing', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_2',
            given_name: undefined,
            family_name: undefined,
            name: '',
            email: undefined,
            last_login: undefined,
            roles: [],
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('should render the empty state when there are no members', () => {
      const props = createMockMemberTableProps({
        members: [],
        pagination: {
          pageSize: 10,
          currentPage: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('member.table.empty_message')).toBeInTheDocument();
      expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    });
  });

  describe('renderName', () => {
    it('should render display name, email, and two-letter initials when given and family names are present', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_name_1',
            given_name: 'Ada',
            family_name: 'Lovelace',
            name: 'ignored-name',
            email: 'ada@example.com',
            roles: [],
            last_login: undefined,
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('ada@example.com')).toBeInTheDocument();
      expect(screen.getByText('AL')).toBeInTheDocument();
    });

    it('should fall back to member.name when given/family names are missing', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_name_2',
            given_name: undefined,
            family_name: undefined,
            name: 'Grace Hopper',
            email: 'grace@example.com',
            roles: [],
            last_login: undefined,
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
      expect(screen.getByText('GH')).toBeInTheDocument();
    });
  });

  describe('renderRoles', () => {
    it('should render "-" when member has no roles', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_roles_1',
            roles: [],
            last_login: undefined,
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('should render all role names joined by comma when there are at most 2 roles', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_roles_2',
            roles: [
              { id: 'r1', name: 'Admin' },
              { id: 'r2', name: 'Member' },
            ],
            last_login: undefined,
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('Admin, Member')).toBeInTheDocument();
      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
    });

    it('should render the first 2 role names with a "+N" suffix when there are more than 2 roles', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_roles_3',
            roles: [
              { id: 'r1', name: 'Admin' },
              { id: 'r2', name: 'Member' },
              { id: 'r3', name: 'Viewer' },
              { id: 'r4', name: 'Editor' },
            ],
            last_login: undefined,
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('Admin, Member, +2')).toBeInTheDocument();
    });
  });

  describe('renderLastLogin', () => {
    it('should render the relative last login label when last_login is a valid date', () => {
      vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T12:00:00.000Z').getTime());

      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_login_1',
            last_login: '2026-05-13T12:00:00.000Z',
            roles: [],
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText(/member\.table\.days/)).toBeInTheDocument();
    });

    it('should render the "never" label when last_login is undefined', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_login_2',
            last_login: undefined,
            roles: [],
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('member.table.never')).toBeInTheDocument();
    });

    it('should render the "never" label when last_login is an invalid date string', () => {
      const props = createMockMemberTableProps({
        members: [
          createMockMember({
            user_id: 'usr_login_3',
            last_login: 'not-a-date',
            roles: [],
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('member.table.never')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should call onNextPage and onPreviousPage when pagination controls are clicked', async () => {
      const user = userEvent.setup();
      const onNextPage = vi.fn();
      const onPreviousPage = vi.fn();
      const props = createMockMemberTableProps({
        onNextPage,
        onPreviousPage,
        pagination: {
          pageSize: 10,
          currentPage: 2,
          totalItems: 25,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      await user.click(screen.getByLabelText('Go to next page'));
      await user.click(screen.getByLabelText('Go to previous page'));

      expect(onNextPage).toHaveBeenCalledTimes(1);
      expect(onPreviousPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Row click navigation', () => {
    it('should navigate to the member when the row is clicked', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      const member = createMockMember({ user_id: 'auth0|row-click', email: 'row@example.com' });
      const props = createMockMemberTableProps({ members: [member], onView });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      await user.click(screen.getByText('row@example.com'));

      expect(onView).toHaveBeenCalledTimes(1);
      expect(onView).toHaveBeenCalledWith('auth0|row-click');
    });

    it('should stay navigable for viewers, whose only path is the row', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      const member = createMockMember({ user_id: 'auth0|viewer-row', email: 'viewer@example.com' });
      const props = createMockMemberTableProps({
        members: [member],
        permissions: VIEWER_MEMBER_PERMISSIONS,
        onView,
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      await user.click(screen.getByText('viewer@example.com'));

      expect(onView).toHaveBeenCalledWith('auth0|viewer-row');
    });

    it('should not navigate when an action inside the row is clicked', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      const props = createMockMemberTableProps({ members: [createMockMember()], onView });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

      expect(onView).not.toHaveBeenCalled();
    });
  });
});
