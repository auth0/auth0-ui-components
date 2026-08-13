import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationMemberAssignRolesModal } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-assign-roles-modal';
import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  createMockAssignRolesModalProps,
  createMockMemberRole,
  createMockAvailableRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('OrganizationMemberAssignRolesModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when isOpen is true', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ isOpen: true })}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ isOpen: false })}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should display the modal title', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal {...createMockAssignRolesModalProps()} />,
      );

      expect(screen.getByText('member.detail.roles.assign_modal.title')).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal {...createMockAssignRolesModalProps()} />,
      );

      expect(
        screen.getByRole('button', { name: 'member.detail.roles.assign_modal.submit_button' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'member.detail.roles.assign_modal.cancel_button' }),
      ).toBeInTheDocument();
    });
  });

  describe('no roles available', () => {
    it('should show no roles message when all roles are already assigned', () => {
      const availableRoles = createMockAvailableRoles();
      const assignedRoles = availableRoles.map((r) =>
        createMockMemberRole({ id: r.id, name: r.name }),
      );

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles, assignedRoles })}
        />,
      );

      expect(
        screen.getByText('member.detail.roles.assign_modal.no_roles_available'),
      ).toBeInTheDocument();
    });

    it('should not show no roles message when there are unassigned roles', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: createMockAvailableRoles(),
            assignedRoles: [],
          })}
        />,
      );

      expect(
        screen.queryByText('member.detail.roles.assign_modal.no_roles_available'),
      ).not.toBeInTheDocument();
    });
  });

  describe('roles label', () => {
    it('should show roles label when there are unassigned roles', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: createMockAvailableRoles(),
            assignedRoles: [],
          })}
        />,
      );

      expect(screen.getByText('member.detail.roles.assign_modal.roles_label')).toBeInTheDocument();
    });
  });

  describe('submit button', () => {
    it('should disable submit button when no roles are selected', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal {...createMockAssignRolesModalProps()} />,
      );

      expect(
        screen.getByRole('button', { name: 'member.detail.roles.assign_modal.submit_button' }),
      ).toBeDisabled();
    });

    it('should disable submit button when isLoading is true', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ isLoading: true })}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'member.detail.roles.assign_modal.submit_button' }),
      ).toBeDisabled();
    });
  });

  describe('onClose', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal {...createMockAssignRolesModalProps({ onClose })} />,
      );

      await user.click(
        screen.getByRole('button', { name: 'member.detail.roles.assign_modal.cancel_button' }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('server-side search', () => {
    it('should render the role selector even when no roles are available', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: [],
            assignedRoles: [],
            onRoleSearch: vi.fn(),
          })}
        />,
      );

      expect(screen.getByText('member.detail.roles.assign_modal.roles_label')).toBeInTheDocument();
      expect(
        screen.queryByText('member.detail.roles.assign_modal.no_roles_available'),
      ).not.toBeInTheDocument();
    });

    it('should call onRoleSearch as the user types in the selector', async () => {
      const onRoleSearch = vi.fn();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: createMockAvailableRoles(),
            assignedRoles: [],
            onRoleSearch,
          })}
        />,
      );

      fireEvent.change(
        screen.getByPlaceholderText('member.detail.roles.assign_modal.roles_placeholder'),
        { target: { value: 'adm' } },
      );

      // The Combobox debounces keystroke-driven onInputChange by 300ms.
      await waitFor(() => {
        expect(onRoleSearch).toHaveBeenCalledWith('adm');
      });
    });

    it('should debounce onRoleSearch: three keystrokes produce one call with the final value', async () => {
      const onRoleSearch = vi.fn();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: createMockAvailableRoles(),
            assignedRoles: [],
            onRoleSearch,
          })}
        />,
      );

      const input = screen.getByPlaceholderText(
        'member.detail.roles.assign_modal.roles_placeholder',
      );
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ad' } });
      fireEvent.change(input, { target: { value: 'adm' } });

      // Synchronous assertion: this is what fails if the debounce is removed and the
      // Combobox emits on every keystroke.
      expect(onRoleSearch).not.toHaveBeenCalled();

      // Exactly one coalesced call, carrying only the final value.
      await waitFor(() => {
        expect(onRoleSearch).toHaveBeenCalledTimes(1);
      });
      expect(onRoleSearch).toHaveBeenCalledWith('adm');
    });

    it('should exclude already-assigned roles from the searched results', () => {
      const availableRoles = createMockAvailableRoles();
      const [firstRole] = availableRoles;

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles,
            assignedRoles: firstRole
              ? [createMockMemberRole({ id: firstRole.id, name: firstRole.name })]
              : [],
            onRoleSearch: vi.fn(),
          })}
        />,
      );

      expect(screen.getByText('member.detail.roles.assign_modal.roles_label')).toBeInTheDocument();
    });
  });

  describe('selection limit', () => {
    // 12 roles so the limit of 10 is reachable with options left over to assert are disabled.
    const manyRoles = Array.from({ length: 12 }, (_, i) => ({
      id: `rol_${i}`,
      name: `Role ${i}`,
      description: `Role ${i} description`,
    }));

    const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(
        screen.getByPlaceholderText('member.detail.roles.assign_modal.roles_placeholder'),
      );
    };

    const selectRoles = async (user: ReturnType<typeof userEvent.setup>, count: number) => {
      for (let i = 0; i < count; i++) {
        await user.click(await screen.findByRole('button', { name: `Role ${i}` }));
      }
    };

    it('should show the limit message once the maximum is selected', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles: manyRoles, assignedRoles: [] })}
        />,
      );

      await openDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      expect(
        screen.getByText('member.detail.roles.assign_modal.max_selection_message'),
      ).toBeInTheDocument();
    });

    it('should not show the limit message below the maximum', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles: manyRoles, assignedRoles: [] })}
        />,
      );

      await openDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST - 1);

      expect(
        screen.queryByText('member.detail.roles.assign_modal.max_selection_message'),
      ).not.toBeInTheDocument();
    });

    it('should disable unselected options at the limit but keep selected ones interactive', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles: manyRoles, assignedRoles: [] })}
        />,
      );

      await openDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      // Role 10 and Role 11 were never picked, so they are now unreachable.
      expect(screen.getByRole('button', { name: 'Role 10' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Role 10' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      // Role 0 is selected — deselecting must stay possible.
      expect(screen.getByRole('button', { name: 'Role 0' })).toBeEnabled();
    });

    it('should ignore clicks on a disabled option', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles: manyRoles, assignedRoles: [] })}
        />,
      );

      await openDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      await user.click(screen.getByRole('button', { name: 'Role 10' }));

      // Still exactly at the limit: the click did not add an 11th selection.
      expect(
        screen.getByText('member.detail.roles.assign_modal.max_selection_message'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Role 10' })).toBeDisabled();
    });

    it('should re-enable options and clear the message after deselecting', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles: manyRoles, assignedRoles: [] })}
        />,
      );

      await openDropdown(user);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      // Clicking a selected option toggles it off.
      await user.click(screen.getByRole('button', { name: 'Role 0' }));

      expect(
        screen.queryByText('member.detail.roles.assign_modal.max_selection_message'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Role 10' })).toBeEnabled();
    });

    it('should skip disabled options during arrow navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ availableRoles: manyRoles, assignedRoles: [] })}
        />,
      );

      const input = screen.getByPlaceholderText(
        'member.detail.roles.assign_modal.roles_placeholder',
      );

      await user.click(input);
      await selectRoles(user, MAX_ROLES_PER_REQUEST);

      // Walks past the last enabled option so a non-skipping implementation would land on a
      // disabled row; a skipping one wraps back onto a selected one.
      for (let i = 0; i < MAX_ROLES_PER_REQUEST + 1; i++) {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      }
      fireEvent.keyDown(input, { key: 'Enter' });

      // Enter landed on a selected option and toggled it off, so we dropped below the limit
      // instead of adding an 11th.
      expect(
        screen.queryByText('member.detail.roles.assign_modal.max_selection_message'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Role 11' })).toBeEnabled();
    });
  });

  describe('isSearchingRoles', () => {
    it('should show the loading row instead of options while searching', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: createMockAvailableRoles(),
            assignedRoles: [],
            onRoleSearch: vi.fn(),
            isSearchingRoles: true,
          })}
        />,
      );

      await user.click(
        screen.getByPlaceholderText('member.detail.roles.assign_modal.roles_placeholder'),
      );

      expect(
        await screen.findByText('member.detail.roles.assign_modal.searching_message'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();
    });

    it('should show options when not searching', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({
            availableRoles: createMockAvailableRoles(),
            assignedRoles: [],
            onRoleSearch: vi.fn(),
            isSearchingRoles: false,
          })}
        />,
      );

      await user.click(
        screen.getByPlaceholderText('member.detail.roles.assign_modal.roles_placeholder'),
      );

      expect(await screen.findByRole('button', { name: 'Admin' })).toBeInTheDocument();
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });
  });
});
