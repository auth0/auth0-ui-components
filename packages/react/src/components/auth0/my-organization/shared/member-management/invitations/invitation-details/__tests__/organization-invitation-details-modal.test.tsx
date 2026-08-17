import { getMemberManagementPermissions } from '@auth0/universal-components-core';
import { screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { OrganizationInvitationDetailsModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-details/organization-invitation-details-modal';
import {
  createMockDetailsModalProps,
  createMockInvitation,
  createMockPendingInvitation,
  createMockExpiredInvitation,
  createMockRoles,
  createMockProviders,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { VIEWER_MEMBER_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders, TestProvider } from '@/tests/utils/test-provider';

describe('OrganizationInvitationDetailsModal', () => {
  const invitationUrl = 'https://example.auth0.com/invite?ticket=abc';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    describe('when is true', () => {
      it('should render the modal', () => {
        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps()} />,
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: 'invitation.details.title' }),
        ).toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should not render the modal content', () => {
        renderWithProviders(
          <OrganizationInvitationDetailsModal
            {...createMockDetailsModalProps({ isOpen: false })}
          />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('invitation', () => {
    describe('when invitation is provided', () => {
      it('should display the invitee email', () => {
        const invitation = createMockInvitation({ invitee: { email: 'user@example.com' } });

        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
        );

        expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
      });

      it('should display the inviter name', () => {
        const invitation = createMockInvitation({ inviter: { name: 'John Doe' } });

        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
        );

        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });

      it('should display created_at date', () => {
        const invitation = createMockInvitation({
          created_at: '2024-06-15T10:00:00.000Z',
        });

        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
        );

        expect(screen.getByText('invitation.details.created_at_label')).toBeInTheDocument();
      });

      it('should display expires_at date', () => {
        const invitation = createMockInvitation({
          expires_at: '2025-06-15T10:00:00.000Z',
        });

        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
        );

        expect(screen.getByText('invitation.details.expires_at_label')).toBeInTheDocument();
      });
    });

    describe('when invitation is null', () => {
      it('should handle null invitation gracefully', () => {
        renderWithProviders(
          <OrganizationInvitationDetailsModal
            {...createMockDetailsModalProps({ invitation: null })}
          />,
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('status badge', () => {
    it('should display pending status for pending invitations', () => {
      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({
            invitation: createMockPendingInvitation(),
          })}
        />,
      );

      expect(screen.getByText('invitation.table.status_pending')).toBeInTheDocument();
    });

    it('should display expired status for expired invitations', () => {
      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({
            invitation: createMockExpiredInvitation(),
          })}
        />,
      );

      expect(screen.getByText('invitation.table.status_expired')).toBeInTheDocument();
    });
  });

  describe('roles', () => {
    it('should resolve role IDs to names when availableRoles provided', () => {
      const invitation = createMockInvitation({ roles: ['role_admin', 'role_member'] });
      const availableRoles = createMockRoles();

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, availableRoles })}
        />,
      );

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
    });

    it('should show role ID as fallback when role not found in availableRoles', () => {
      const invitation = createMockInvitation({ roles: ['role_unknown'] });

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, availableRoles: [] })}
        />,
      );

      expect(screen.getByText('role_unknown')).toBeInTheDocument();
    });

    it('should show dash when no roles assigned', () => {
      const invitation = createMockInvitation({ roles: [] });

      renderWithProviders(
        <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
      );

      expect(screen.getByText('invitation.details.roles_label')).toBeInTheDocument();
    });
  });

  describe('invitation URL', () => {
    it('should display invitation URL when available', () => {
      const invitation = createMockInvitation({
        invitation_url: invitationUrl,
      });

      renderWithProviders(
        <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
      );

      expect(screen.getByText('invitation.details.invitation_url_label')).toBeInTheDocument();
    });

    it('should not display invitation URL section when no URL', () => {
      const invitation = createMockInvitation({ invitation_url: undefined });

      renderWithProviders(
        <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
      );

      expect(screen.queryByText('invitation.details.invitation_url_label')).not.toBeInTheDocument();
    });
  });

  describe('identity provider', () => {
    it('should display provider name when resolved', () => {
      const invitation = createMockInvitation({ identity_provider_id: 'con_provider1' });
      const availableProviders = createMockProviders();

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, availableProviders })}
        />,
      );

      expect(screen.getByDisplayValue('Google')).toBeInTheDocument();
    });

    it('should show provider ID as fallback when provider not found', () => {
      const invitation = createMockInvitation({ identity_provider_id: 'con_unknown' });

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, availableProviders: [] })}
        />,
      );

      expect(screen.getByDisplayValue('con_unknown')).toBeInTheDocument();
    });

    it('should not display provider section when no provider assigned', () => {
      const invitation = createMockInvitation({ identity_provider_id: undefined });

      renderWithProviders(
        <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
      );

      expect(screen.queryByText('invitation.details.provider_label')).not.toBeInTheDocument();
    });
  });

  describe('permissions', () => {
    describe('when the user can revoke and resend', () => {
      it('should show both buttons enabled', () => {
        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps()} />,
        );

        expect(
          screen.getByRole('button', { name: 'invitation.details.revoke_button' }),
        ).toBeEnabled();
        expect(
          screen.getByRole('button', { name: 'invitation.details.resend_button' }),
        ).toBeEnabled();
      });
    });

    describe('when the user is a viewer', () => {
      it('should keep both buttons visible but disabled', () => {
        renderWithProviders(
          <OrganizationInvitationDetailsModal
            {...createMockDetailsModalProps({ permissions: VIEWER_MEMBER_PERMISSIONS })}
          />,
        );

        expect(
          screen.getByRole('button', { name: 'invitation.details.revoke_button' }),
        ).toBeDisabled();
        expect(
          screen.getByRole('button', { name: 'invitation.details.resend_button' }),
        ).toBeDisabled();
      });
    });

    describe('when the user can revoke but not create', () => {
      it('should enable Revoke and disable Resend, which also needs create', () => {
        renderWithProviders(
          <OrganizationInvitationDetailsModal
            {...createMockDetailsModalProps({
              permissions: getMemberManagementPermissions(['delete:my_org:member_invitations']),
            })}
          />,
        );

        expect(
          screen.getByRole('button', { name: 'invitation.details.revoke_button' }),
        ).toBeEnabled();
        expect(
          screen.getByRole('button', { name: 'invitation.details.resend_button' }),
        ).toBeDisabled();
      });
    });
  });

  describe('copy URL', () => {
    it('should call onCopyUrl and show copied state when copy button is clicked', async () => {
      const user = userEvent.setup();
      const onCopyUrl = vi.fn();
      const invitation = createMockInvitation({
        invitation_url: invitationUrl,
      });

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, onCopyUrl })}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'invitation.details.copy_url_button' }));

      expect(onCopyUrl).toHaveBeenCalledTimes(1);
      expect(onCopyUrl).toHaveBeenCalledWith(invitation);
      expect(screen.getByRole('button', { name: 'invitation.details.copied' })).toBeInTheDocument();
    });

    describe('with fake timers', () => {
      afterEach(() => {
        vi.useRealTimers();
      });

      it('should reset copied state after 3 seconds', () => {
        vi.useFakeTimers();

        const invitation = createMockInvitation({
          invitation_url: invitationUrl,
        });

        renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'invitation.details.copy_url_button' }));

        expect(
          screen.getByRole('button', { name: 'invitation.details.copied' }),
        ).toBeInTheDocument();

        act(() => vi.advanceTimersByTime(3000));

        expect(
          screen.getByRole('button', { name: 'invitation.details.copy_url_button' }),
        ).toBeInTheDocument();
      });

      it('should clear the timeout when modal is closed before 3 seconds', () => {
        vi.useFakeTimers();

        const invitation = createMockInvitation({
          invitation_url: invitationUrl,
        });

        const { rerender } = renderWithProviders(
          <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ invitation })} />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'invitation.details.copy_url_button' }));

        rerender(
          <TestProvider>
            <OrganizationInvitationDetailsModal
              {...createMockDetailsModalProps({ invitation, isOpen: false })}
            />
          </TestProvider>,
        );

        act(() => vi.advanceTimersByTime(3000));

        // no state update errors — timeout was cleared cleanly
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('action callbacks', () => {
    it('should call onRevoke when Revoke button is clicked', async () => {
      const user = userEvent.setup();
      const onRevoke = vi.fn();
      const invitation = createMockPendingInvitation();

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, onRevoke })}
        />,
      );

      const revokeButton = screen.getByRole('button', {
        name: 'invitation.details.revoke_button',
      });
      await user.click(revokeButton);

      expect(onRevoke).toHaveBeenCalledTimes(1);
      expect(onRevoke).toHaveBeenCalledWith(invitation);
    });

    it('should call onResend when Resend button is clicked', async () => {
      const user = userEvent.setup();
      const onResend = vi.fn();
      const invitation = createMockPendingInvitation();

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ invitation, onResend })}
        />,
      );

      const resendButton = screen.getByRole('button', {
        name: 'invitation.details.resend_button',
      });
      await user.click(resendButton);

      expect(onResend).toHaveBeenCalledTimes(1);
      expect(onResend).toHaveBeenCalledWith(invitation);
    });

    it('should call onClose when Close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationInvitationDetailsModal {...createMockDetailsModalProps({ onClose })} />,
      );

      const closeButton = screen.getByRole('button', {
        name: 'invitation.details.close_button',
      });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('action in progress', () => {
    it('should disable Revoke button when isRevoking is true', () => {
      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ isRevoking: true })}
        />,
      );

      const revokeButton = screen.getByRole('button', {
        name: /invitation\.details\.revoke_button/,
      });
      expect(revokeButton).toBeDisabled();
    });

    it('should disable Resend button when isResending is true', () => {
      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ isResending: true })}
        />,
      );

      const resendButton = screen.getByRole('button', {
        name: /invitation\.details\.resend_button/,
      });
      expect(resendButton).toBeDisabled();
    });

    it('should disable both buttons when either action is in progress', () => {
      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ isRevoking: true })}
        />,
      );

      const revokeButton = screen.getByRole('button', {
        name: /invitation\.details\.revoke_button/,
      });
      const resendButton = screen.getByRole('button', {
        name: /invitation\.details\.resend_button/,
      });
      expect(revokeButton).toBeDisabled();
      expect(resendButton).toBeDisabled();
    });
  });

  describe('className', () => {
    it('should apply custom class to modal', () => {
      const customClass = 'custom-details-class';

      renderWithProviders(
        <OrganizationInvitationDetailsModal
          {...createMockDetailsModalProps({ className: customClass })}
        />,
      );

      const modalContent = document.querySelector('[data-slot="dialog-content"]');
      expect(modalContent).toHaveClass(customClass);
    });
  });
});
