import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberEditRolesTab } from '../organization-member-roles-tab';

import {
  createMockAvailableRoles,
  createMockMemberRole,
  createMockMemberRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import {
  ADMIN_MEMBER_PERMISSIONS,
  EDITOR_MEMBER_PERMISSIONS,
  VIEWER_MEMBER_PERMISSIONS,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';
import type { MemberDetailModalState } from '@/types/my-organization/member-management/organization-member-detail-types';

mockToast();

const noModal: MemberDetailModalState = { type: null };

const createProps = (overrides = {}) => ({
  customMessages: {},
  memberRoles: createMockMemberRoles(),
  searchedRoles: createMockAvailableRoles(),
  onRoleSearch: vi.fn(),
  selectedRoles: [],
  isFetchingMemberRoles: false,
  removingRoleIds: [],
  isAssigningRoles: false,
  modalState: noModal,
  permissions: ADMIN_MEMBER_PERMISSIONS,
  onSelectedRolesChange: vi.fn(),
  onAssignRolesClick: vi.fn(),
  onAssignRolesCancel: vi.fn(),
  onAssignRolesSubmit: vi.fn(),
  onRemoveRolesClick: vi.fn(),
  onRemoveRolesCancel: vi.fn(),
  onRemoveRolesConfirm: vi.fn(),
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
        <OrganizationMemberEditRolesTab {...createProps({ isFetchingMemberRoles: true })} />,
      );
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  describe('onAssignRolesClick', () => {
    it('calls handler when assign button is clicked', async () => {
      const user = userEvent.setup();
      const onAssignRolesClick = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ onAssignRolesClick })} />,
      );
      await user.click(screen.getByRole('button', { name: /member.detail.roles.assign_button/i }));
      expect(onAssignRolesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('row selection', () => {
    it('when 1 role selected shows selection label and bulk remove button; hides assign button', () => {
      const roles = createMockMemberRoles();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedRoles: [roles[0]!] })} />,
      );
      expect(screen.getByText('member.detail.roles.roles_selected')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /member.detail.roles.remove_button/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /member.detail.roles.assign_button/i }),
      ).not.toBeInTheDocument();
    });

    it('when 2 roles selected shows plural selection label', () => {
      const roles = createMockMemberRoles();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedRoles: roles })} />,
      );
      expect(screen.getByText('member.detail.roles.roles_selected_plural')).toBeInTheDocument();
    });

    it('calls onSelectedRolesChange when a row checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelectedRolesChange = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ onSelectedRolesChange })} />,
      );
      await user.click(screen.getByRole('checkbox', { name: 'data_table.select_row 1' }));
      expect(onSelectedRolesChange).toHaveBeenCalled();
    });
  });

  describe('onRemoveRolesClick (per-row trash)', () => {
    it('calls handler with correct role when trash button clicked', async () => {
      const user = userEvent.setup();
      const onRemoveRolesClick = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ onRemoveRolesClick })} />,
      );
      // aria-label is the raw i18n key (mock translator has no interpolation)
      const removeButtons = screen.getAllByRole('button', {
        name: 'member.detail.roles.table.remove_button_label',
      });
      await user.click(removeButtons[0]!);
      expect(onRemoveRolesClick).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Admin' })]),
      );
    });
  });

  describe('removingRoleIds', () => {
    it('when matches a role id that role trash button is disabled', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ removingRoleIds: ['rol_admin'] })} />,
      );
      const removeButtons = screen.getAllByRole('button', {
        name: 'member.detail.roles.table.remove_button_label',
      });
      // First button corresponds to Admin (rol_admin) — should be disabled
      expect(removeButtons[0]).toBeDisabled();
    });

    it('when empty all trash buttons are enabled', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ removingRoleIds: [] })} />,
      );
      const removeButtons = screen.getAllByRole('button', {
        name: 'member.detail.roles.table.remove_button_label',
      });
      removeButtons.forEach((btn) => expect(btn).not.toBeDisabled());
    });
  });

  describe('MemberAssignRolesModal', () => {
    it('when modalState is assignRoles modal is visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ modalState: { type: 'assignRoles' } satisfies MemberDetailModalState })}
        />,
      );
      expect(screen.getByText('member.detail.roles.assign_modal.title')).toBeInTheDocument();
    });

    it('when modalState is null modal is not visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ modalState: noModal })} />,
      );
      expect(screen.queryByText('member.detail.roles.assign_modal.title')).not.toBeInTheDocument();
    });

    it('cancel clicked calls onAssignRolesCancel', async () => {
      const user = userEvent.setup();
      const onAssignRolesCancel = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            modalState: { type: 'assignRoles' } satisfies MemberDetailModalState,
            onAssignRolesCancel,
          })}
        />,
      );
      await user.click(
        screen.getByRole('button', { name: /member.detail.roles.assign_modal.cancel_button/i }),
      );
      expect(onAssignRolesCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('MemberRemoveRoleModal', () => {
    const removeRolesState: MemberDetailModalState = {
      type: 'removeRoles',
      roles: [createMockMemberRole()],
    };

    it('when modalState is removeRoles modal is visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ modalState: removeRolesState })} />,
      );
      expect(screen.getByText('member.detail.roles.remove_confirm.title')).toBeInTheDocument();
    });

    it('when modalState is null modal is not visible', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ modalState: noModal })} />,
      );
      expect(
        screen.queryByText('member.detail.roles.remove_confirm.title'),
      ).not.toBeInTheDocument();
    });

    it('cancel clicked calls onRemoveRolesCancel', async () => {
      const user = userEvent.setup();
      const onRemoveRolesCancel = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ modalState: removeRolesState, onRemoveRolesCancel })}
        />,
      );
      await user.click(
        screen.getByRole('button', {
          name: /member.detail.roles.remove_confirm.cancel_button/i,
        }),
      );
      expect(onRemoveRolesCancel).toHaveBeenCalledTimes(1);
    });

    it('confirm clicked calls onRemoveRolesConfirm', async () => {
      const user = userEvent.setup();
      const onRemoveRolesConfirm = vi.fn();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ modalState: removeRolesState, onRemoveRolesConfirm })}
        />,
      );
      await user.click(
        screen.getByRole('button', {
          name: /member.detail.roles.remove_confirm.confirm_button/i,
        }),
      );
      expect(onRemoveRolesConfirm).toHaveBeenCalledTimes(1);
    });

    it('when isRemovingRoles is true modal shows loading indicator', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            modalState: removeRolesState,
            isRemovingRoles: true,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
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

  describe('permission tiers', () => {
    const assignButtonName = 'member.detail.roles.assign_button';

    describe('when the user is an admin', () => {
      it('enables the assign roles button', () => {
        renderWithProviders(
          <OrganizationMemberEditRolesTab
            {...createProps({ permissions: ADMIN_MEMBER_PERMISSIONS })}
          />,
        );

        expect(screen.getByRole('button', { name: assignButtonName })).toBeEnabled();
      });

      it('enables the per-role remove buttons', () => {
        renderWithProviders(
          <OrganizationMemberEditRolesTab
            {...createProps({ permissions: ADMIN_MEMBER_PERMISSIONS })}
          />,
        );

        const [removeButton] = screen.getAllByRole('button', {
          name: /member\.detail\.roles\.table\.remove_button_label/,
        });
        expect(removeButton).toBeEnabled();
      });
    });

    describe('when the user is an editor', () => {
      it('enables assign but disables the per-role remove buttons', () => {
        renderWithProviders(
          <OrganizationMemberEditRolesTab
            {...createProps({ permissions: EDITOR_MEMBER_PERMISSIONS })}
          />,
        );

        expect(screen.getByRole('button', { name: assignButtonName })).toBeEnabled();

        const [removeButton] = screen.getAllByRole('button', {
          name: /member\.detail\.roles\.table\.remove_button_label/,
        });
        expect(removeButton).toBeDisabled();
      });
    });

    describe('when the user is a viewer', () => {
      it('keeps assign visible but disabled', () => {
        renderWithProviders(
          <OrganizationMemberEditRolesTab
            {...createProps({ permissions: VIEWER_MEMBER_PERMISSIONS })}
          />,
        );

        expect(screen.getByRole('button', { name: assignButtonName })).toBeDisabled();
      });

      it('keeps the per-role remove buttons visible but disabled', () => {
        renderWithProviders(
          <OrganizationMemberEditRolesTab
            {...createProps({ permissions: VIEWER_MEMBER_PERMISSIONS })}
          />,
        );

        const [removeButton] = screen.getAllByRole('button', {
          name: /member\.detail\.roles\.table\.remove_button_label/,
        });
        expect(removeButton).toBeDisabled();
      });
    });
  });
});
