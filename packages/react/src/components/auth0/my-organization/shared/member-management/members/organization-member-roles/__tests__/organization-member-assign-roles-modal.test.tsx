import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationMemberAssignRolesModal } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-assign-roles-modal';
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

    it('should show spinner when isLoadingRoles is true', () => {
      renderWithProviders(
        <OrganizationMemberAssignRolesModal
          {...createMockAssignRolesModalProps({ isLoadingRoles: true })}
        />,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(
        screen.queryByText('member.detail.roles.assign_modal.roles_label'),
      ).not.toBeInTheDocument();
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

    it('should call onRoleSearch as the user types in the selector', () => {
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
});
