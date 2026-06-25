import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { OrganizationInvitationRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-revoke-modal';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockRevokeModalProps,
  createMockPendingInvitation,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';

describe('OrganizationInvitationRevokeModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    describe('when is true', () => {
      it('should render the modal', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal {...createMockRevokeModalProps()} />,
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should not render the modal content', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal {...createMockRevokeModalProps({ isOpen: false })} />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('revoke mode', () => {
    describe('when isRevokeAndResend is false', () => {
      it('should render revoke-specific title', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isRevokeAndResend: false })}
          />,
        );

        expect(screen.getByText('invitation.revoke.title')).toBeInTheDocument();
      });

      it('should render revoke-specific description', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isRevokeAndResend: false })}
          />,
        );

        expect(screen.getByText('invitation.revoke.description')).toBeInTheDocument();
      });

      it('should render revoke-specific button text', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isRevokeAndResend: false })}
          />,
        );

        expect(
          screen.getByRole('button', { name: 'invitation.revoke.confirm_button' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'invitation.revoke.cancel_button' }),
        ).toBeInTheDocument();
      });
    });

    describe('when isRevokeAndResend is true', () => {
      it('should render revoke-and-resend title', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isRevokeAndResend: true })}
          />,
        );

        expect(screen.getByText('invitation.revoke_resend.title')).toBeInTheDocument();
      });

      it('should render revoke-and-resend description', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isRevokeAndResend: true })}
          />,
        );

        expect(screen.getByText('invitation.revoke_resend.description')).toBeInTheDocument();
      });

      it('should render revoke-and-resend button text', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isRevokeAndResend: true })}
          />,
        );

        expect(
          screen.getByRole('button', { name: 'invitation.revoke_resend.confirm_button' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'invitation.revoke_resend.cancel_button' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is true', () => {
      it('should disable confirm button', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isLoading: true })}
          />,
        );

        const confirmButton = screen.getByRole('button', {
          name: /invitation\.revoke\.confirm_button/,
        });
        expect(confirmButton).toBeDisabled();
      });

      it('should disable cancel button', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isLoading: true })}
          />,
        );

        const cancelButton = screen.getByRole('button', {
          name: 'invitation.revoke.cancel_button',
        });
        expect(cancelButton).toBeDisabled();
      });
    });

    describe('when is false', () => {
      it('should enable confirm button', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ isLoading: false })}
          />,
        );

        const confirmButton = screen.getByRole('button', {
          name: 'invitation.revoke.confirm_button',
        });
        expect(confirmButton).toBeEnabled();
      });
    });
  });

  describe('onConfirm', () => {
    it('should call onConfirm with invitation when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const invitation = createMockPendingInvitation();

      renderWithProviders(
        <OrganizationInvitationRevokeModal
          {...createMockRevokeModalProps({ invitation, onConfirm })}
        />,
      );

      const confirmButton = screen.getByRole('button', {
        name: 'invitation.revoke.confirm_button',
      });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith(invitation);
    });

    it('should not call onConfirm when invitation is null', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      renderWithProviders(
        <OrganizationInvitationRevokeModal
          {...createMockRevokeModalProps({ invitation: null, onConfirm })}
        />,
      );

      const confirmButton = screen.getByRole('button', {
        name: 'invitation.revoke.confirm_button',
      });
      await user.click(confirmButton);

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationInvitationRevokeModal {...createMockRevokeModalProps({ onClose })} />,
      );

      const cancelButton = screen.getByRole('button', {
        name: 'invitation.revoke.cancel_button',
      });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('className', () => {
    it('should apply custom class to modal', () => {
      const customClass = 'custom-revoke-class';

      renderWithProviders(
        <OrganizationInvitationRevokeModal
          {...createMockRevokeModalProps({ className: customClass })}
        />,
      );

      const modalContent = document.querySelector('[data-slot="dialog-content"]');
      expect(modalContent).toHaveClass(customClass);
    });
  });

  describe('invitation', () => {
    describe('when invitation is null', () => {
      it('should handle null invitation gracefully', () => {
        renderWithProviders(
          <OrganizationInvitationRevokeModal
            {...createMockRevokeModalProps({ invitation: null })}
          />,
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
