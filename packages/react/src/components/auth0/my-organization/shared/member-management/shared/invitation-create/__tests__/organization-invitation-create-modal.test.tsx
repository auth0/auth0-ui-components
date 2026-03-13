import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockCreateModalProps,
  createMockRoles,
  createMockProviders,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';

describe('OrganizationInvitationCreateModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    describe('when is true', () => {
      it('should render the modal', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal {...createMockCreateModalProps()} />,
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('invitation.create.title')).toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should not render the modal content', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal {...createMockCreateModalProps({ isOpen: false })} />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is true', () => {
      it('should disable form inputs', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ isLoading: true })}
          />,
        );

        const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
        expect(emailInput).toBeDisabled();
      });

      it('should disable cancel and submit buttons', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ isLoading: true })}
          />,
        );

        const cancelButton = screen.getByRole('button', {
          name: 'invitation.create.cancel_button',
        });
        expect(cancelButton).toBeDisabled();
      });
    });

    describe('when is false', () => {
      it('should enable form inputs', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ isLoading: false })}
          />,
        );

        const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
        expect(emailInput).toBeEnabled();
      });
    });
  });

  describe('className', () => {
    describe('when className is provided', () => {
      it('should apply custom class to modal', () => {
        const customClass = 'custom-modal-class';

        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ className: customClass })}
          />,
        );

        const modalContent = document.querySelector('[data-slot="dialog-content"]');
        expect(modalContent).toHaveClass(customClass);
      });
    });
  });

  describe('onClose', () => {
    describe('when modal is closed', () => {
      it('should call onClose callback via cancel button', async () => {
        const user = userEvent.setup();
        const mockOnClose = vi.fn();

        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ onClose: mockOnClose })}
          />,
        );

        const cancelButton = screen.getByRole('button', {
          name: 'invitation.create.cancel_button',
        });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('email input', () => {
    it('should render email input field', () => {
      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      expect(
        screen.getByPlaceholderText('invitation.create.email_placeholder'),
      ).toBeInTheDocument();
      expect(screen.getByText('invitation.create.email_label')).toBeInTheDocument();
    });

    it('should show helper text by default', () => {
      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      expect(screen.getByText('invitation.create.email_helper')).toBeInTheDocument();
    });
  });

  describe('submit', () => {
    it('should disable submit button when no emails are added', () => {
      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      expect(submitButton).toBeDisabled();
    });

    it('should show creating text when isLoading is true', () => {
      renderWithProviders(
        <OrganizationInvitationCreateModal {...createMockCreateModalProps({ isLoading: true })} />,
      );

      expect(screen.getByText('invitation.create.creating')).toBeInTheDocument();
    });
  });

  describe('availableRoles', () => {
    describe('when roles are provided', () => {
      it('should render roles combobox', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableRoles: createMockRoles() })}
          />,
        );

        expect(screen.getByText('invitation.create.roles_label')).toBeInTheDocument();
      });
    });

    describe('when no roles are provided', () => {
      it('should not render roles combobox', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableRoles: [] })}
          />,
        );

        expect(screen.queryByText('invitation.create.roles_label')).not.toBeInTheDocument();
      });
    });
  });

  describe('availableProviders', () => {
    describe('when providers are provided', () => {
      it('should render provider dropdown', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({
              availableProviders: createMockProviders(),
            })}
          />,
        );

        expect(screen.getByText('invitation.create.provider_label')).toBeInTheDocument();
      });
    });

    describe('when no providers are provided', () => {
      it('should not render provider dropdown', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableProviders: [] })}
          />,
        );

        expect(screen.queryByText('invitation.create.provider_label')).not.toBeInTheDocument();
      });
    });
  });

  describe('description', () => {
    it('should render description text', () => {
      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      expect(screen.getByText('invitation.create.description')).toBeInTheDocument();
    });
  });
});
