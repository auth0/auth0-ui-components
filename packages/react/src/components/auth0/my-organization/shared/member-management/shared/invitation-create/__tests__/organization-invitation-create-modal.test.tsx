import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal';
import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
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
      it('should call onRoleSearch when typing in the role selector', async () => {
        const onRoleSearch = vi.fn();

        renderWithProviders(
          <OrganizationInvitationCreateModal
            {...createMockCreateModalProps({ availableRoles: createMockRoles(), onRoleSearch })}
          />,
        );

        fireEvent.change(screen.getByPlaceholderText('invitation.create.roles_placeholder'), {
          target: { value: 'adm' },
        });

        // The Combobox debounces keystroke-driven onInputChange by 300ms.
        await waitFor(() => {
          expect(onRoleSearch).toHaveBeenCalledWith('adm');
        });
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

      expect(screen.getByText('invitation.create.connection_group_user_store')).toBeInTheDocument();
      expect(
        screen.getByText('invitation.create.connection_group_identity_provider'),
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

    it('should still render the connection section when no connections are provided', () => {
      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: [] })}
        />,
      );

      expect(screen.getByText(/invitation\.create\.connection_label/)).toBeInTheDocument();
    });

    it('should keep submit disabled until a connection is selected', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: createMockConnections() })}
        />,
      );

      const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter' });

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      expect(submitButton).toBeDisabled();

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Google'));

      expect(submitButton).toBeEnabled();
    });

    it('should render the connection label as required', () => {
      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: createMockConnections() })}
        />,
      );

      expect(screen.getByText(/invitation\.create\.connection_label/)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('description', () => {
    it('should render description text', () => {
      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      expect(screen.getByText('invitation.create.description')).toBeInTheDocument();
    });
  });

  describe('role selection limit', () => {
    // 12 roles so the limit of 10 is reachable with options left over to assert are disabled.
    const manyRoles = Array.from({ length: 12 }, (_, i) => ({
      id: `role_${i}`,
      name: `Role ${i}`,
      description: `Role ${i} description`,
    }));

    const openRolesDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByPlaceholderText('invitation.create.roles_placeholder'));
    };

    const selectRoles = async (user: ReturnType<typeof userEvent.setup>, count: number) => {
      for (let i = 0; i < count; i++) {
        await user.click(await screen.findByRole('button', { name: `Role ${i}` }));
      }
    };

    it('should show the limit message once the maximum is selected', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableRoles: manyRoles })}
        />,
      );

      await openRolesDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      expect(screen.getByText('invitation.create.roles_max_selection_message')).toBeInTheDocument();
    });

    it('should not show the limit message below the maximum', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableRoles: manyRoles })}
        />,
      );

      await openRolesDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST - 1);

      expect(
        screen.queryByText('invitation.create.roles_max_selection_message'),
      ).not.toBeInTheDocument();
    });

    it('should disable unselected options at the limit but keep selected ones interactive', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableRoles: manyRoles })}
        />,
      );

      await openRolesDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      expect(screen.getByRole('button', { name: 'Role 10' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Role 10' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Role 0' })).toBeEnabled();
    });

    it('should ignore clicks on a disabled option', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableRoles: manyRoles })}
        />,
      );

      await openRolesDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      await user.click(screen.getByRole('button', { name: 'Role 10' }));

      expect(screen.getByText('invitation.create.roles_max_selection_message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Role 10' })).toBeDisabled();
    });

    it('should re-enable options and clear the message after deselecting', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableRoles: manyRoles })}
        />,
      );

      await openRolesDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      await user.click(screen.getByRole('button', { name: 'Role 0' }));

      expect(
        screen.queryByText('invitation.create.roles_max_selection_message'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Role 10' })).toBeEnabled();
    });

    // See Task 8 Step 5 for why this needs MAX_ROLES_PER_REQUEST + 1 presses rather than one:
    // a single ArrowDown lands on index 0 under both the correct and the broken
    // implementation, so it would pass even with the navigation skip removed.
    it('should skip disabled options during arrow navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableRoles: manyRoles })}
        />,
      );

      await openRolesDropdown(user);
      const input = screen.getByPlaceholderText('invitation.create.roles_placeholder');
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      for (let i = 0; i < MAX_ROLES_PER_REQUEST + 1; i++) {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      }
      fireEvent.keyDown(input, { key: 'Enter' });

      // Enter landed on a selected option and toggled it off, so we dropped below the limit
      // instead of adding an 11th.
      expect(
        screen.queryByText('invitation.create.roles_max_selection_message'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Role 11' })).toBeEnabled();
    });
  });

  describe('isSearchingRoles', () => {
    it('should show the loading row instead of options while searching', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({
            availableRoles: createMockRoles(),
            onRoleSearch: vi.fn(),
            isSearchingRoles: true,
          })}
        />,
      );

      await user.click(screen.getByPlaceholderText('invitation.create.roles_placeholder'));

      expect(
        await screen.findByText('invitation.create.roles_searching_message'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();
    });

    it('should show options when not searching', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({
            availableRoles: createMockRoles(),
            onRoleSearch: vi.fn(),
            isSearchingRoles: false,
          })}
        />,
      );

      await user.click(screen.getByPlaceholderText('invitation.create.roles_placeholder'));

      expect(await screen.findByRole('button', { name: 'Admin' })).toBeInTheDocument();
      expect(
        screen.queryByText('invitation.create.roles_searching_message'),
      ).not.toBeInTheDocument();
    });
  });
});
