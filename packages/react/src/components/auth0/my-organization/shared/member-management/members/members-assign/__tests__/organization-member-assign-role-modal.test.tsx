import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberAssignRolesModal } from '@/components/auth0/my-organization/shared/member-management/members/members-assign/organization-member-assign-role-modal';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockMember,
  createMockMemberAssignRoleModalProps,
  createMockRoleOptions,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('OrganizationMemberAssignRolesModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when open', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal {...createMockMemberAssignRoleModalProps()} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal content when closed', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({ isOpen: false })}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('should render title, label, and action buttons when roles are available', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal {...createMockMemberAssignRoleModalProps()} />,
      );

      expect(screen.getByText('member.assign_role_modal.title')).toBeInTheDocument();
      expect(screen.getByText('member.assign_role_modal.roles_label')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('member.assign_role_modal.roles_placeholder'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'member.assign_role_modal.cancel_button' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'member.assign_role_modal.submit_button' }),
      ).toBeDisabled();
    });

    it('should show no roles message when all roles are already assigned', () => {
      const availableRoles = createMockRoleOptions();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({
            availableRoles,
            assignedRoles: availableRoles.map((role) => ({ id: role.id })),
          })}
        />,
      );

      expect(screen.getByText('member.assign_role_modal.no_roles_available')).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText('member.assign_role_modal.roles_placeholder'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'member.assign_role_modal.submit_button' }),
      ).toBeDisabled();
    });
  });

  describe('loading state', () => {
    it('should disable the combobox and action buttons when loading', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({ isLoading: true })}
        />,
      );

      expect(
        screen.getByPlaceholderText('member.assign_role_modal.roles_placeholder'),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'member.assign_role_modal.cancel_button' }),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'member.assign_role_modal.submit_button' }),
      ).toBeDisabled();
    });
  });

  describe('callbacks', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({ onClose })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'member.assign_role_modal.cancel_button' }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onAssign with selected role ids when submit is clicked', async () => {
      const user = userEvent.setup();
      const onAssign = vi.fn();
      const member = createMockMember({ user_id: 'usr_assign_1' });

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({ member, onAssign })}
        />,
      );

      await user.click(screen.getByPlaceholderText('member.assign_role_modal.roles_placeholder'));
      await user.click(screen.getByRole('button', { name: 'Admin' }));

      const submitButton = screen.getByRole('button', {
        name: 'member.assign_role_modal.submit_button',
      });
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      expect(onAssign).toHaveBeenCalledTimes(1);
      expect(onAssign).toHaveBeenCalledWith('usr_assign_1', ['role_admin']);
    });

    it('should not call onAssign when member is null', async () => {
      const user = userEvent.setup();
      const onAssign = vi.fn();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({ member: null, onAssign })}
        />,
      );

      await user.click(screen.getByPlaceholderText('member.assign_role_modal.roles_placeholder'));
      await user.click(screen.getByRole('button', { name: 'Admin' }));
      await user.click(
        screen.getByRole('button', { name: 'member.assign_role_modal.submit_button' }),
      );

      expect(onAssign).not.toHaveBeenCalled();
    });

    it('should filter out already assigned roles from the combobox options', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockMemberAssignRoleModalProps({
            assignedRoles: [{ id: 'role_admin' }],
          })}
        />,
      );

      await user.click(screen.getByPlaceholderText('member.assign_role_modal.roles_placeholder'));

      expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Member' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Viewer' })).toBeInTheDocument();
    });
  });
});
