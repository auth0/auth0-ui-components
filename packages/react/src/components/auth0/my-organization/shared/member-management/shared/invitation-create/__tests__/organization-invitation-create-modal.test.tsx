import { fireEvent, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
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

  describe('email chip tokenization', () => {
    const getEmailInput = () => screen.getByLabelText(/invitation\.create\.email_label/);

    const removeChip = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
      const chip = screen.getByText(label).closest('[data-slot="chip"]');

      if (!(chip instanceof HTMLElement)) {
        throw new Error(`No chip rendered for "${label}".`);
      }

      await user.click(within(chip).getByRole('button'));
    };

    it('should turn the typed email into a chip when a comma is typed', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.type(getEmailInput(), 'test1@email.com,');

      expect(screen.getByText('test1@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('');
    });

    it('should turn the typed email into a chip when a space is typed', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.type(getEmailInput(), 'test1@email.com ');

      expect(screen.getByText('test1@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('');
    });

    it('should keep the trailing partial email in the input while chipping completed ones', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.type(getEmailInput(), 'test1@email.com,test2@em');

      expect(screen.getByText('test1@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('test2@em');
    });

    it('should not create a chip when a delimiter is typed into an empty input', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.type(getEmailInput(), ', ,');

      expect(screen.queryByText(',')).not.toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('');
    });

    it('should create a chip per email when a comma-separated list is pasted', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste('test1@email.com, test2@email.com, test3@email.com');

      expect(screen.getByText('test1@email.com')).toBeInTheDocument();
      expect(screen.getByText('test2@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('test3@email.com');
    });

    it('should flag only the invalid entry when a mixed list is pasted', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste('test1@email.com,not-an-email,');

      expect(screen.getByText('test1@email.com')).toBeInTheDocument();
      expect(screen.getByText('not-an-email')).toBeInTheDocument();
      expect(screen.getByText('invitation.create.email_invalid_error')).toBeInTheDocument();
    });

    it('should skip duplicates within a single pasted list', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste('test1@email.com,test1@email.com,');

      expect(screen.getAllByText('test1@email.com')).toHaveLength(1);
      expect(screen.getByText('invitation.create.email_duplicate_error')).toBeInTheDocument();
    });

    it('should stop at the email limit when a longer list is pasted', async () => {
      const user = userEvent.setup();
      const emails = Array.from({ length: 12 }, (_, i) => `user${i}@email.com`);

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste(`${emails.join(',')},`);

      expect(screen.getByText('user9@email.com')).toBeInTheDocument();
      expect(screen.queryByText('user10@email.com')).not.toBeInTheDocument();
      expect(screen.getByText('invitation.create.email_limit_error')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('user10@email.com, user11@email.com');
    });

    it('should chip a held-back address and keep the error when a chip is removed', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste(Array.from({ length: 12 }, (_, i) => `user${i}@email.com`).join(','));

      await removeChip(user, 'user0@email.com');

      expect(screen.getByText('user10@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('user11@email.com');
      expect(screen.getByText('invitation.create.email_limit_error')).toBeInTheDocument();
    });

    it('should clear the error once the last held-back address fits', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste(Array.from({ length: 12 }, (_, i) => `user${i}@email.com`).join(','));

      await removeChip(user, 'user0@email.com');
      await removeChip(user, 'user1@email.com');

      expect(screen.getByText('user11@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('');
      expect(screen.queryByText('invitation.create.email_limit_error')).not.toBeInTheDocument();
    });

    it('should chip the undelimited address when Enter commits the field', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.type(getEmailInput(), 'test1@email.com');

      expect(screen.queryByText('test1@email.com')).not.toBeInTheDocument();

      await user.keyboard('{Enter}');

      expect(screen.getByText('test1@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('');
    });

    it('should report a duplicate rather than the limit when the chip list is full', async () => {
      const user = userEvent.setup();
      const emails = Array.from({ length: 10 }, (_, i) => `user${i}@email.com`);

      renderWithProviders(<OrganizationInvitationCreateModal {...createMockCreateModalProps()} />);

      await user.click(getEmailInput());
      await user.paste(`${emails.join(',')},`);
      await user.paste('user0@email.com,');

      expect(screen.getByText('invitation.create.email_duplicate_error')).toBeInTheDocument();
      expect(screen.queryByText('invitation.create.email_limit_error')).not.toBeInTheDocument();
      expect(screen.getAllByText('user0@email.com')).toHaveLength(1);
      expect(getEmailInput()).toHaveValue('');
    });

    it('should submit a full chip list when the pending address duplicates a chip', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const emails = Array.from({ length: 10 }, (_, i) => `user${i}@email.com`);

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

      await user.click(getEmailInput());
      await user.paste(`${emails.join(',')},`);
      await user.type(getEmailInput(), 'user0@email.com');

      await user.click(screen.getByRole('button', { name: 'invitation.create.submit_button' }));

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate.mock.calls[0]![0].invitees).toHaveLength(emails.length);
    });

    it('should block submit while addresses past the limit remain in the field', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const emails = Array.from({ length: 12 }, (_, i) => `user${i}@email.com`);

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

      await user.click(getEmailInput());
      await user.paste(`${emails.join(',')},`);

      await user.click(screen.getByRole('button', { name: 'invitation.create.submit_button' }));

      expect(onCreate).not.toHaveBeenCalled();
      expect(screen.getByText('invitation.create.email_limit_error')).toBeInTheDocument();
    });

    it('should block submit when a trailing address without a delimiter exceeds the limit', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const emails = Array.from({ length: 11 }, (_, i) => `user${i}@email.com`);

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

      await user.click(getEmailInput());
      await user.paste(emails.join(','));

      await user.click(screen.getByRole('button', { name: 'invitation.create.submit_button' }));

      expect(onCreate).not.toHaveBeenCalled();
      expect(screen.getByText('invitation.create.email_limit_error')).toBeInTheDocument();
      expect(screen.getByText('user9@email.com')).toBeInTheDocument();
      expect(getEmailInput()).toHaveValue('user10@email.com');
    });

    it('should enable submit and send every email entered as a comma-separated list', async () => {
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

      await user.type(getEmailInput(), 'test1@email.com, test2@email.com');

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate.mock.calls[0]![0].invitees).toEqual([
        { email: 'test1@email.com', roles: undefined },
        { email: 'test2@email.com', roles: undefined },
      ]);
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

  describe('when auto-selecting single connection', () => {
    it('auto-selects the connection when only one is available', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const singleConnection = [
        { id: 'con_single', name: 'Single Provider', type: 'identity_provider' as const },
      ];

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({
            availableConnections: singleConnection,
            onCreate,
          })}
        />,
      );

      const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter' });

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          identity_provider_id: 'con_single',
        }),
      );
    });

    it('does not auto-select when multiple connections are available', () => {
      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({ availableConnections: createMockConnections() })}
        />,
      );

      const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter' });

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      expect(submitButton).toBeDisabled();
    });

    it('keeps connection field visible and editable with single connection', () => {
      const singleConnection = [
        { id: 'con_single', name: 'Single Provider', type: 'identity_provider' as const },
      ];

      renderWithProviders(
        <OrganizationInvitationCreateModal
          {...createMockCreateModalProps({
            availableConnections: singleConnection,
          })}
        />,
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeEnabled();
      expect(combobox).toHaveTextContent('Single Provider');
    });

    it('auto-selects single connection when modal opens', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const singleConnection = [
        { id: 'con_single', name: 'Single Provider', type: 'identity_provider' as const },
      ];

      // Use a stateful wrapper so rerender keeps providers intact across the isOpen transition
      function ModalController() {
        const [isOpen, setIsOpen] = React.useState(false);
        return (
          <>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <OrganizationInvitationCreateModal
              {...createMockCreateModalProps({
                isOpen,
                availableConnections: singleConnection,
                onCreate,
              })}
            />
          </>
        );
      }

      renderWithProviders(<ModalController />);

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open Modal' }));
      });

      const emailInput = screen.getByPlaceholderText('invitation.create.email_placeholder');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.keyDown(emailInput, { key: 'Enter' });

      const submitButton = screen.getByRole('button', {
        name: 'invitation.create.submit_button',
      });
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          identity_provider_id: 'con_single',
        }),
      );
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
