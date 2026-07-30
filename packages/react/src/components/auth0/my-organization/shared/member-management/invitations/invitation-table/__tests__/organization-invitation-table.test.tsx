import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import { createMockInvitation } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';
import type { OrganizationInvitationTableProps } from '@/types/my-organization/member-management/organization-invitation-table-types';

mockToast();

const invitations = [
  createMockInvitation({ id: 'inv_1', invitee: { email: 'a@example.com' } }),
  createMockInvitation({ id: 'inv_2', invitee: { email: 'b@example.com' } }),
];

const createProps = (
  overrides: Partial<OrganizationInvitationTableProps> = {},
): OrganizationInvitationTableProps => ({
  invitations,
  loading: false,
  customMessages: {},
  pagination: {
    pageSize: 10,
    currentPage: 1,
    totalItems: invitations.length,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  ...overrides,
});

afterEach(() => vi.clearAllMocks());

describe('OrganizationInvitationTable', () => {
  describe('selection UI', () => {
    it('does not render selection checkboxes when onSelectedInvitationsChange is not provided', () => {
      renderWithProviders(<OrganizationInvitationTable {...createProps()} />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('does not render selection checkboxes in read-only mode', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({ readOnly: true, onSelectedInvitationsChange: vi.fn() })}
        />,
      );
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('renders selection checkboxes when selection is enabled', () => {
      renderWithProviders(
        <OrganizationInvitationTable {...createProps({ onSelectedInvitationsChange: vi.fn() })} />,
      );
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });

    it('calls onSelectedInvitationsChange when a row checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable {...createProps({ onSelectedInvitationsChange })} />,
      );
      await user.click(screen.getAllByRole('checkbox', { name: 'data_table.select_row' })[0]!);
      expect(onSelectedInvitationsChange).toHaveBeenCalled();
    });
  });

  describe('bulk revoke button', () => {
    it('is hidden when no invitations are selected', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({ onSelectedInvitationsChange: vi.fn(), selectedInvitations: [] })}
        />,
      );
      expect(
        screen.queryByRole('button', { name: 'invitation.bulk_revoke.button' }),
      ).not.toBeInTheDocument();
    });

    it('shows the singular count label when 1 invitation is selected', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: [invitations[0]!],
          })}
        />,
      );
      expect(screen.getByText('invitation.bulk_revoke.count')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'invitation.bulk_revoke.button' }),
      ).toBeInTheDocument();
    });

    it('shows the plural count label when multiple invitations are selected', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: invitations,
          })}
        />,
      );
      expect(screen.getByText('invitation.bulk_revoke.count_plural')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'invitation.bulk_revoke.button_plural' }),
      ).toBeInTheDocument();
    });

    it('calls onBulkRevoke with the selected invitations when clicked', async () => {
      const user = userEvent.setup();
      const onBulkRevoke = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createProps({
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: invitations,
            onBulkRevoke,
          })}
        />,
      );
      await user.click(
        screen.getByRole('button', { name: 'invitation.bulk_revoke.button_plural' }),
      );
      expect(onBulkRevoke).toHaveBeenCalledWith(invitations);
    });
  });
});
