import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberEditRolesTab } from '../organization-member-roles-tab';

import {
  createMockAvailableRoles,
  createMockMemberRole,
  createMockMemberRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';

mockToast();

const createProps = (overrides = {}) => ({
  customMessages: {},
  memberRoles: createMockMemberRoles(),
  availableRoles: createMockAvailableRoles(),
  isFetchingRoles: false,
  removingRoleId: null,
  showAssignRolesModal: false,
  isAssigningRole: false,
  showRemoveRoleModal: false,
  roleToRemove: null,
  handleAssignRolesClick: vi.fn(),
  handleAssignRolesCancel: vi.fn(),
  handleAssignRolesSubmit: vi.fn(),
  handleRemoveRoleClick: vi.fn(),
  handleRemoveRoleCancel: vi.fn(),
  handleRemoveRoleConfirm: vi.fn(),
  ...overrides,
});

afterEach(() => vi.clearAllMocks());

describe('OrganizationMemberEditRolesTab', () => {
  describe('rendering', () => {
    it('renders roles title and description', () => {
      renderWithProviders(<OrganizationMemberEditRolesTab {...createProps()} />);
      expect(screen.getByText('member.detail.roles.title')).toBeInTheDocument();
      expect(screen.getByText('member.detail.roles.description')).toBeInTheDocument();
    });

    it('renders assign button when no rows selected', () => {
      renderWithProviders(<OrganizationMemberEditRolesTab {...createProps()} />);
      expect(
        screen.getByRole('button', { name: /member.detail.roles.assign_button/i }),
      ).toBeInTheDocument();
    });

    it('renders each role name and description in the table', () => {
      renderWithProviders(<OrganizationMemberEditRolesTab {...createProps()} />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(screen.getByText('Administrator role')).toBeInTheDocument();
      expect(screen.getByText('Member role')).toBeInTheDocument();
    });

    it('renders empty state when memberRoles is empty', () => {
      renderWithProviders(<OrganizationMemberEditRolesTab {...createProps({ memberRoles: [] })} />);
      expect(screen.getByText('member.detail.roles.table.empty_message')).toBeInTheDocument();
    });

    it('renders loading state when isFetchingRoles is true', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ isFetchingRoles: true })} />,
      );
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  describe('handleAssignRolesClick', () => {
    it('calls handler when assign button is clicked', async () => {
      const user = userEvent.setup();
      const handleAssignRolesClick = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ handleAssignRolesClick })} />,
      );
      await user.click(screen.getByRole('button', { name: /member.detail.roles.assign_button/i }));
      expect(handleAssignRolesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('row selection', () => {
    it('when 1 role selected shows "1 role selected" label and bulk remove button; hides assign button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationMemberEditRolesTab {...createProps()} />);
      await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      expect(screen.getByText(/1 role selected/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /member.detail.roles.remove_button/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /member.detail.roles.assign_button/i }),
      ).not.toBeInTheDocument();
    });

    it('when 2 roles selected shows "2 roles selected" label', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationMemberEditRolesTab {...createProps()} />);
      await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
      await user.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
      expect(screen.getByText(/2 roles selected/)).toBeInTheDocument();
    });
  });

  describe('handleRemoveRoleClick (per-row trash)', () => {
    it('calls handler with correct role when trash button clicked', async () => {
      const user = userEvent.setup();
      const handleRemoveRoleClick = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ handleRemoveRoleClick })} />,
      );
      await user.click(screen.getByRole('button', { name: 'Remove role Admin' }));
      expect(handleRemoveRoleClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Admin' }),
      );
    });
  });

  describe('removingRoleId', () => {
    it('when matches a role id that role trash button is disabled', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ removingRoleId: 'rol_admin' })} />,
      );
      expect(screen.getByRole('button', { name: 'Remove role Admin' })).toBeDisabled();
    });

    it('when null all trash buttons are enabled', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ removingRoleId: null })} />,
      );
      expect(screen.getByRole('button', { name: 'Remove role Admin' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Remove role Member' })).not.toBeDisabled();
    });
  });

  describe('MemberAssignRolesModal', () => {
    it('when showAssignRolesModal true modal is visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ showAssignRolesModal: true })} />,
      );
      expect(screen.getByText('member.detail.roles.assign_modal.title')).toBeInTheDocument();
    });

    it('when showAssignRolesModal false modal is not visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ showAssignRolesModal: false })} />,
      );
      expect(screen.queryByText('member.detail.roles.assign_modal.title')).not.toBeInTheDocument();
    });

    it('cancel clicked calls handleAssignRolesCancel', async () => {
      const user = userEvent.setup();
      const handleAssignRolesCancel = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ showAssignRolesModal: true, handleAssignRolesCancel })}
        />,
      );
      await user.click(
        screen.getByRole('button', { name: /member.detail.roles.assign_modal.cancel_button/i }),
      );
      expect(handleAssignRolesCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('MemberRemoveRoleModal', () => {
    it('when showRemoveRoleModal true modal is visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            showRemoveRoleModal: true,
            roleToRemove: createMockMemberRole(),
          })}
        />,
      );
      expect(screen.getByText('member.detail.roles.remove_confirm.title')).toBeInTheDocument();
    });

    it('when showRemoveRoleModal false modal is not visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ showRemoveRoleModal: false })} />,
      );
      expect(
        screen.queryByText('member.detail.roles.remove_confirm.title'),
      ).not.toBeInTheDocument();
    });

    it('cancel clicked calls handleRemoveRoleCancel', async () => {
      const user = userEvent.setup();
      const handleRemoveRoleCancel = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            showRemoveRoleModal: true,
            roleToRemove: createMockMemberRole(),
            handleRemoveRoleCancel,
          })}
        />,
      );
      await user.click(
        screen.getByRole('button', {
          name: /member.detail.roles.remove_confirm.cancel_button/i,
        }),
      );
      expect(handleRemoveRoleCancel).toHaveBeenCalledTimes(1);
    });

    it('confirm clicked calls handleRemoveRoleConfirm', async () => {
      const user = userEvent.setup();
      const handleRemoveRoleConfirm = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            showRemoveRoleModal: true,
            roleToRemove: createMockMemberRole(),
            handleRemoveRoleConfirm,
          })}
        />,
      );
      await user.click(
        screen.getByRole('button', {
          name: /member.detail.roles.remove_confirm.confirm_button/i,
        }),
      );
      expect(handleRemoveRoleConfirm).toHaveBeenCalledTimes(1);
    });

    it('when removingRoleId is set modal shows loading indicator', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            showRemoveRoleModal: true,
            roleToRemove: createMockMemberRole(),
            removingRoleId: 'rol_admin',
          })}
        />,
      );
      expect(screen.getByRole('button', { name: '...' })).toBeInTheDocument();
    });
  });

  describe('customMessages', () => {
    it('overrides roles title text', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            customMessages: { member: { detail: { roles: { title: 'Custom Roles Title' } } } },
          })}
        />,
      );
      expect(screen.getByText('Custom Roles Title')).toBeInTheDocument();
    });
  });
});
