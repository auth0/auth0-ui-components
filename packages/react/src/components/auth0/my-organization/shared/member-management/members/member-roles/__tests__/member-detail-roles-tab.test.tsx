import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { MemberDetailRolesTab } from '@/components/auth0/my-organization/shared/member-management/members/member-roles/member-detail-roles-tab';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockRolesTabProps,
  createMockMemberRole,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('MemberDetailRolesTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the roles section title', () => {
      renderWithProviders(<MemberDetailRolesTab {...createMockRolesTabProps()} />);

      expect(screen.getByText('member.detail.roles.title')).toBeInTheDocument();
    });

    it('should render the roles description', () => {
      renderWithProviders(<MemberDetailRolesTab {...createMockRolesTabProps()} />);

      expect(screen.getByText('member.detail.roles.description')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      renderWithProviders(<MemberDetailRolesTab {...createMockRolesTabProps()} />);

      expect(screen.getByText('member.detail.roles.table.name')).toBeInTheDocument();
      expect(screen.getByText('member.detail.roles.table.description')).toBeInTheDocument();
    });
  });

  describe('roles data', () => {
    it('should render role names in the table', () => {
      const memberRoles = [
        createMockMemberRole({ id: 'rol_1', name: 'Admin', description: 'Admin role' }),
        createMockMemberRole({ id: 'rol_2', name: 'Viewer', description: 'Viewer role' }),
      ];

      renderWithProviders(<MemberDetailRolesTab {...createMockRolesTabProps({ memberRoles })} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('should render role descriptions in the table', () => {
      const memberRoles = [
        createMockMemberRole({ id: 'rol_1', name: 'Admin', description: 'Administrator role' }),
      ];

      renderWithProviders(<MemberDetailRolesTab {...createMockRolesTabProps({ memberRoles })} />);

      expect(screen.getByText('Administrator role')).toBeInTheDocument();
    });

    it('should not display description text when description is absent', () => {
      const memberRoles = [
        createMockMemberRole({ id: 'rol_1', name: 'Admin', description: undefined }),
      ];

      renderWithProviders(<MemberDetailRolesTab {...createMockRolesTabProps({ memberRoles })} />);

      // The role name should still render
      expect(screen.getByText('Admin')).toBeInTheDocument();
      // The specific description text from the mock default is not present
      expect(screen.queryByText('Administrator role')).not.toBeInTheDocument();
    });

    it('should show empty state message when there are no roles', () => {
      renderWithProviders(
        <MemberDetailRolesTab {...createMockRolesTabProps({ memberRoles: [] })} />,
      );

      expect(screen.getByText('member.detail.roles.table.empty_message')).toBeInTheDocument();
    });
  });

  describe('assign roles button', () => {
    it('should show assign button when readOnly is false', () => {
      renderWithProviders(
        <MemberDetailRolesTab {...createMockRolesTabProps({ readOnly: false })} />,
      );

      expect(
        screen.getByRole('button', { name: /member\.detail\.roles\.assign_button/i }),
      ).toBeInTheDocument();
    });

    it('should hide assign button when readOnly is true', () => {
      renderWithProviders(
        <MemberDetailRolesTab {...createMockRolesTabProps({ readOnly: true })} />,
      );

      expect(
        screen.queryByRole('button', { name: /member\.detail\.roles\.assign_button/i }),
      ).not.toBeInTheDocument();
    });

    it('should call onAssignRolesClick when assign button is clicked', async () => {
      const user = userEvent.setup();
      const onAssignRolesClick = vi.fn();

      renderWithProviders(
        <MemberDetailRolesTab
          {...createMockRolesTabProps({ readOnly: false, onAssignRolesClick })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /member\.detail\.roles\.assign_button/i }),
      );

      expect(onAssignRolesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove role button', () => {
    it('should render trash icon button for each role when not readOnly', () => {
      const memberRoles = [
        createMockMemberRole({ id: 'rol_1', name: 'Admin' }),
        createMockMemberRole({ id: 'rol_2', name: 'Viewer' }),
      ];

      renderWithProviders(
        <MemberDetailRolesTab {...createMockRolesTabProps({ memberRoles, readOnly: false })} />,
      );

      expect(screen.getByLabelText('Remove role Admin')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove role Viewer')).toBeInTheDocument();
    });

    it('should not render trash icon when readOnly is true', () => {
      const memberRoles = [createMockMemberRole({ id: 'rol_1', name: 'Admin' })];

      renderWithProviders(
        <MemberDetailRolesTab {...createMockRolesTabProps({ memberRoles, readOnly: true })} />,
      );

      expect(screen.queryByLabelText('Remove role Admin')).not.toBeInTheDocument();
    });

    it('should call onRemoveRole with the role when trash button is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveRole = vi.fn();
      const role = createMockMemberRole({ id: 'rol_1', name: 'Admin' });

      renderWithProviders(
        <MemberDetailRolesTab
          {...createMockRolesTabProps({ memberRoles: [role], readOnly: false, onRemoveRole })}
        />,
      );

      await user.click(screen.getByLabelText('Remove role Admin'));

      expect(onRemoveRole).toHaveBeenCalledTimes(1);
      expect(onRemoveRole).toHaveBeenCalledWith(role);
    });

    it('should disable trash button for role being removed', () => {
      const role = createMockMemberRole({ id: 'rol_1', name: 'Admin' });

      renderWithProviders(
        <MemberDetailRolesTab
          {...createMockRolesTabProps({
            memberRoles: [role],
            readOnly: false,
            removingRoleId: 'rol_1',
          })}
        />,
      );

      expect(screen.getByLabelText('Remove role Admin')).toBeDisabled();
    });
  });
});
