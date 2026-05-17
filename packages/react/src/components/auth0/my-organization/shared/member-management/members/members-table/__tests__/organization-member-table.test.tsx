import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberTable } from '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockMember,
  createMockMemberTableProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

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
            last_login: '2026-05-13T12:00:00.000Z',
            roles: [
              { id: 'role_admin', name: 'Admin' },
              { id: 'role_member', name: 'Member' },
              { id: 'role_viewer', name: 'Viewer' },
            ],
          }),
        ],
      });

      renderWithProviders(<OrganizationMemberTable {...props} />);

      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('ada@example.com')).toBeInTheDocument();
      expect(screen.getByText('AL')).toBeInTheDocument();
      expect(screen.getByText('Admin, Member, +1')).toBeInTheDocument();
      expect(screen.getByText('2 days ago')).toBeInTheDocument();
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
});
