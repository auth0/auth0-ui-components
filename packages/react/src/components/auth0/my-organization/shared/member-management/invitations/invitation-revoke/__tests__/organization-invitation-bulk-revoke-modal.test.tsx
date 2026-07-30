import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationInvitationBulkRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-bulk-revoke-modal';
import {
  createMockBulkRevokeModalProps,
  createMockInvitations,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';

mockToast();

const invitations = createMockInvitations();

afterEach(() => vi.clearAllMocks());

describe('OrganizationInvitationBulkRevokeModal', () => {
  it('does not render content when closed', () => {
    renderWithProviders(
      <OrganizationInvitationBulkRevokeModal
        {...createMockBulkRevokeModalProps({ invitations, isOpen: false })}
      />,
    );
    expect(
      screen.queryByText('invitation.bulk_revoke.confirm.title_plural'),
    ).not.toBeInTheDocument();
  });

  it('renders the singular title when a single invitation is selected', () => {
    renderWithProviders(
      <OrganizationInvitationBulkRevokeModal
        {...createMockBulkRevokeModalProps({ invitations: [invitations[0]!] })}
      />,
    );
    expect(screen.getByText('invitation.bulk_revoke.confirm.title')).toBeInTheDocument();
  });

  it('renders the plural title when multiple invitations are selected', () => {
    renderWithProviders(
      <OrganizationInvitationBulkRevokeModal
        {...createMockBulkRevokeModalProps({ invitations })}
      />,
    );
    expect(screen.getByText('invitation.bulk_revoke.confirm.title_plural')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <OrganizationInvitationBulkRevokeModal
        {...createMockBulkRevokeModalProps({ invitations, onConfirm })}
      />,
    );
    await user.click(
      screen.getByRole('button', {
        name: 'invitation.bulk_revoke.confirm.confirm_button_plural',
      }),
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <OrganizationInvitationBulkRevokeModal
        {...createMockBulkRevokeModalProps({ invitations, onClose })}
      />,
    );
    await user.click(
      screen.getByRole('button', { name: 'invitation.bulk_revoke.confirm.cancel_button' }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the cancel button while loading', () => {
    renderWithProviders(
      <OrganizationInvitationBulkRevokeModal
        {...createMockBulkRevokeModalProps({ invitations, isLoading: true })}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'invitation.bulk_revoke.confirm.cancel_button' }),
    ).toBeDisabled();
  });
});
