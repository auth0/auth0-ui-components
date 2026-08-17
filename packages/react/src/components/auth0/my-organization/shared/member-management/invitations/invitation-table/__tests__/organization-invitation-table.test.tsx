import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import {
  createMockPendingInvitation,
  createMockRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import {
  ADMIN_MEMBER_PERMISSIONS,
  VIEWER_MEMBER_PERMISSIONS,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { OrganizationInvitationTableProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

const createProps = (
  overrides: Partial<OrganizationInvitationTableProps> = {},
): OrganizationInvitationTableProps => ({
  invitations: [createMockPendingInvitation()],
  loading: false,
  pagination: {
    pageSize: 10,
    currentPage: 1,
    totalItems: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {},
  sortConfig: { key: null, direction: 'asc' },
  availableRoles: createMockRoles(),
  permissions: ADMIN_MEMBER_PERMISSIONS,
  onView: vi.fn(),
  onCopyUrl: vi.fn(),
  onRevokeAndResend: vi.fn(),
  onRevoke: vi.fn(),
  onNextPage: vi.fn(),
  onPreviousPage: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortChange: vi.fn(),
  onRoleFilterChange: vi.fn(),
  ...overrides,
});

describe('OrganizationInvitationTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Row click navigation', () => {
    it('should open the invitation when the row is clicked', async () => {
      const user = userEvent.setup();
      const invitation = createMockPendingInvitation();
      const onView = vi.fn();

      renderWithProviders(
        <OrganizationInvitationTable {...createProps({ invitations: [invitation], onView })} />,
      );

      await user.click(screen.getByText(invitation.invitee!.email!));

      expect(onView).toHaveBeenCalledTimes(1);
      expect(onView).toHaveBeenCalledWith(invitation);
    });

    it('should stay navigable for viewers, whose only path is the row', async () => {
      const user = userEvent.setup();
      const invitation = createMockPendingInvitation();
      const onView = vi.fn();

      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({
            invitations: [invitation],
            permissions: VIEWER_MEMBER_PERMISSIONS,
            onView,
          })}
        />,
      );

      await user.click(screen.getByText(invitation.invitee!.email!));

      expect(onView).toHaveBeenCalledWith(invitation);
    });

    it('should not navigate when the row actions menu is clicked', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();

      renderWithProviders(<OrganizationInvitationTable {...createProps({ onView })} />);

      await user.click(screen.getByRole('button', { name: 'invitation.actions.menu_label' }));

      expect(onView).not.toHaveBeenCalled();
    });
  });

  describe('Permission tiers', () => {
    it('should render no row actions menu for viewers', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({ permissions: VIEWER_MEMBER_PERMISSIONS })}
        />,
      );

      expect(
        screen.queryByRole('button', { name: 'invitation.actions.menu_label' }),
      ).not.toBeInTheDocument();
    });

    it('should render the row actions menu for admins', () => {
      renderWithProviders(<OrganizationInvitationTable {...createProps()} />);

      expect(
        screen.getByRole('button', { name: 'invitation.actions.menu_label' }),
      ).toBeInTheDocument();
    });
  });
});
