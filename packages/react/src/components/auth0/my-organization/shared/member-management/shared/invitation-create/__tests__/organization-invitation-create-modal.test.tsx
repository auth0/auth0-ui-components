import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal';
import {
  createMockCreateModalProps,
  createMockRoles,
  createMockConnections,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

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
      expect(screen.getByText(/invitation\.create\.email_label/)).toBeInTheDocument();
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
      it('should still render roles section', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableRoles: [] })}
          />,
        );

        expect(screen.getByText('invitation.create.roles_label')).toBeInTheDocument();
      });
    });

    describe('server-side search', () => {
      it('should call onRoleSearch when typing in the role selector', () => {
        const onRoleSearch = vi.fn();

        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableRoles: createMockRoles(), onRoleSearch })}
          />,
        );

        fireEvent.change(screen.getByPlaceholderText('invitation.create.roles_placeholder'), {
          target: { value: 'adm' },
        });

        expect(onRoleSearch).toHaveBeenCalledWith('adm');
      });

      it('should keep the role selector enabled with no roles when searching', () => {
        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableRoles: [], onRoleSearch: vi.fn() })}
          />,
        );

        expect(
          screen.getByPlaceholderText('invitation.create.roles_placeholder'),
        ).not.toBeDisabled();
      });
    });
  });

  describe('availableConnections', () => {
    const addEmailAndSubmit = async (onCreate: ReturnType<typeof vi.fn>) => {
      const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter' });

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      await userEvent.click(submitButton);

      expect(onCreate).toHaveBeenCalledTimes(1);
      return onCreate.mock.calls[0]![0];
    };

    it('should render both identity providers and user stores in the picker', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: createMockConnections() })}
        />,
      );

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Acme Directory')).toBeInTheDocument();
    });

    it('should render user store and identity provider group headers', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: createMockConnections() })}
        />,
      );

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('invitation.create.provider_group_user_store')).toBeInTheDocument();
      expect(
        screen.getByText('invitation.create.provider_group_identity_provider'),
      ).toBeInTheDocument();
    });

    it('should submit identity_provider_id when an identity provider is selected', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({
            availableConnections: createMockConnections(),
            onCreate,
          })}
        />,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Google'));

      const payload = await addEmailAndSubmit(onCreate);
      expect(payload.identity_provider_id).toBe('con_provider1');
      expect(payload.user_store_id).toBeUndefined();
    });

    it('should submit user_store_id when a user store is selected', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({
            availableConnections: createMockConnections(),
            onCreate,
          })}
        />,
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Acme Directory'));

      const payload = await addEmailAndSubmit(onCreate);
      expect(payload.user_store_id).toBe('us_store1');
      expect(payload.identity_provider_id).toBeUndefined();
    });

    it('should still render the provider section when no connections are provided', () => {
      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: [] })}
        />,
      );

      expect(screen.getByText('invitation.create.provider_label')).toBeInTheDocument();
    });
  });

  describe('description', () => {
    it('should render description text', () => {
      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      expect(screen.getByText('invitation.create.description')).toBeInTheDocument();
    });
  });
});
