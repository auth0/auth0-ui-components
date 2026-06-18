import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationMemberDetailRolesTab } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-detail-roles-tab';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockRolesTabProps,
  createMockMemberRole,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('OrganizationMemberDetailRolesTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the roles section title', () => {
      renderWithProviders(<OrganizationMemberDetailRolesTab {...createMockRolesTabProps()} />);

      expect(screen.getByText('member.detail.roles.title')).toBeInTheDocument();
    });

    it('should render the roles description', () => {
      renderWithProviders(<OrganizationMemberDetailRolesTab {...createMockRolesTabProps()} />);

      expect(screen.getByText('member.detail.roles.description')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      renderWithProviders(<OrganizationMemberDetailRolesTab {...createMockRolesTabProps()} />);

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

      renderWithProviders(
        <OrganizationMemberDetailRolesTab {...createMockRolesTabProps({ memberRoles })} />,
      );

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('should render role descriptions in the table', () => {
      const memberRoles = [
        createMockMemberRole({ id: 'rol_1', name: 'Admin', description: 'Administrator role' }),
      ];

      renderWithProviders(
        <OrganizationMemberDetailRolesTab {...createMockRolesTabProps({ memberRoles })} />,
      );

      expect(screen.getByText('Administrator role')).toBeInTheDocument();
    });

    it('should not display description text when description is absent', () => {
      const memberRoles = [
        createMockMemberRole({ id: 'rol_1', name: 'Admin', description: undefined }),
      ];

      renderWithProviders(
        <OrganizationMemberDetailRolesTab {...createMockRolesTabProps({ memberRoles })} />,
      );

      // The role name should still render
      expect(screen.getByText('Admin')).toBeInTheDocument();
      // The specific description text from the mock default is not present
      expect(screen.queryByText('Administrator role')).not.toBeInTheDocument();
    });

    it('should show empty state message when there are no roles', () => {
      renderWithProviders(
        <OrganizationMemberDetailRolesTab {...createMockRolesTabProps({ memberRoles: [] })} />,
      );

      expect(screen.getByText('member.detail.roles.table.empty_message')).toBeInTheDocument();
    });
  });

  describe('assign roles button', () => {
    it('should show assign button when readOnly is false', () => {
      renderWithProviders(
        <OrganizationMemberDetailRolesTab {...createMockRolesTabProps({ readOnly: false })} />,
      );

      expect(
        screen.getByRole('button', { name: /member\.detail\.roles\.assign_button/i }),
      ).toBeInTheDocument();
    });

    it('should hide assign button when readOnly is true', () => {
      renderWithProviders(
        <OrganizationMemberDetailRolesTab {...createMockRolesTabProps({ readOnly: true })} />,
      );

      expect(
        screen.queryByRole('button', { name: /member\.detail\.roles\.assign_button/i }),
      ).not.toBeInTheDocument();
    });

    it('should call onAssignRolesClick when assign button is clicked', async () => {
      const user = userEvent.setup();
      const onAssignRolesClick = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetailRolesTab
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
        <OrganizationMemberDetailRolesTab
          {...createMockRolesTabProps({ memberRoles, readOnly: false })}
        />,
      );

      expect(
        screen.getAllByLabelText('member.detail.roles.table.remove_button_label'),
      ).toHaveLength(2);
    });

    it('should not render trash icon when readOnly is true', () => {
      const memberRoles = [createMockMemberRole({ id: 'rol_1', name: 'Admin' })];

      renderWithProviders(
        <OrganizationMemberDetailRolesTab
          {...createMockRolesTabProps({ memberRoles, readOnly: true })}
        />,
      );

      expect(
        screen.queryByLabelText('member.detail.roles.table.remove_button_label'),
      ).not.toBeInTheDocument();
    });

    it('should call onRemoveRoles with the role when trash button is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveRoles = vi.fn();
      const role = createMockMemberRole({ id: 'rol_1', name: 'Admin' });

      renderWithProviders(
        <OrganizationMemberDetailRolesTab
          {...createMockRolesTabProps({ memberRoles: [role], readOnly: false, onRemoveRoles })}
        />,
      );

      await user.click(screen.getByLabelText('member.detail.roles.table.remove_button_label'));

      expect(onRemoveRoles).toHaveBeenCalledTimes(1);
      expect(onRemoveRoles).toHaveBeenCalledWith([role]);
    });

    it('should disable trash button for role being removed', () => {
      const role = createMockMemberRole({ id: 'rol_1', name: 'Admin' });

      renderWithProviders(
        <OrganizationMemberDetailRolesTab
          {...createMockRolesTabProps({
            memberRoles: [role],
            readOnly: false,
            removingRoleIds: ['rol_1'],
          })}
        />,
      );

      expect(screen.getByLabelText('member.detail.roles.table.remove_button_label')).toBeDisabled();
    });
  });
});
