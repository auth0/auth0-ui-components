import type { Role } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberEditRolesTab } from '../organization-member-roles-tab';

import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  createMockAvailableRoles,
  createMockMember,
  createMockMemberRole,
  createMockMemberRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { captureSelection, nth, tooltipTriggerFor } from '@/tests/utils/test-assertions';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';
import type { MemberDetailModalState } from '@/types/my-organization/member-management/organization-member-detail-types';

mockToast();

const noModal: MemberDetailModalState = { type: null };

const createProps = (overrides = {}) => ({
  customMessages: {},
  selectedMember: createMockMember(),
  memberRoles: createMockMemberRoles(),
  searchedRoles: createMockAvailableRoles(),
  onRoleSearch: vi.fn(),
  selectedRoles: [],
  isFetchingMemberRoles: false,
  removingRoleIds: [],
  isAssigningRoles: false,
  modalState: noModal,
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
        <OrganizationMemberEditRolesTab {...createProps({ selectedRoles: [nth(roles, 0)] })} />,
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
      await user.click(nth(screen.getAllByRole('checkbox', { name: 'data_table.select_row' }), 0));
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
      await user.click(nth(removeButtons, 0));
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

  describe('Access Level Gating', () => {
    it('disables Assign Roles button when member has readonly access_level', () => {
      const member = createMockMember({ access_level: 'readonly' });
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedMember: member })} />,
      );
      const assignButton = screen.getByRole('button', {
        name: /member.detail.roles.assign_button/i,
      });
      expect(assignButton).toBeDisabled();
    });

    it('disables Remove Roles button when member has readonly access_level and roles are selected', () => {
      const member = createMockMember({ access_level: 'readonly' });
      const roles = createMockMemberRoles();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ selectedMember: member, selectedRoles: [nth(roles, 0)] })}
        />,
      );
      const removeButton = screen.getByRole('button', {
        name: /member.detail.roles.remove_button/i,
      });
      expect(removeButton).toBeDisabled();
    });

    it('disables per-row trash buttons when member has readonly access_level', () => {
      const member = createMockMember({ access_level: 'readonly' });
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedMember: member })} />,
      );
      const removeButtons = screen.getAllByRole('button', {
        name: 'member.detail.roles.table.remove_button_label',
      });
      removeButtons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('hides row selection checkboxes when member has readonly access_level', () => {
      const member = createMockMember({ access_level: 'readonly' });
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedMember: member })} />,
      );
      expect(
        screen.queryByRole('checkbox', { name: 'data_table.select_row' }),
      ).not.toBeInTheDocument();
    });

    it('enables Assign Roles button when member has full access_level', () => {
      const member = createMockMember({ access_level: 'full' });
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedMember: member })} />,
      );
      const assignButton = screen.getByRole('button', {
        name: /member.detail.roles.assign_button/i,
      });
      expect(assignButton).not.toBeDisabled();
    });

    it('enables per-row trash buttons when member has limited access_level', () => {
      const member = createMockMember({ access_level: 'limited' });
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedMember: member })} />,
      );
      const removeButtons = screen.getAllByRole('button', {
        name: 'member.detail.roles.table.remove_button_label',
      });
      removeButtons.forEach((btn) => expect(btn).not.toBeDisabled());
    });

    it('shows row selection checkboxes when member has full access_level', () => {
      const member = createMockMember({ access_level: 'full' });
      renderWithProviders(
        <OrganizationMemberEditRolesTab {...createProps({ selectedMember: member })} />,
      );
      expect(
        screen.getAllByRole('checkbox', { name: 'data_table.select_row' }).length,
      ).toBeGreaterThan(0);
    });
  });

  describe('selection limit', () => {
    // The roles table is unpaginated and a member can hold up to MAX_ROLES_PER_MEMBER (50), so
    // this fixture is the worst case the cap exists for.
    const manyRoles = Array.from({ length: 50 }, (_, i) =>
      createMockMemberRole({
        id: `rol_${i}`,
        name: `Role ${i}`,
        description: `Description ${i}`,
      }),
    );

    it('disables unselected checkboxes once MAX_ROLES_PER_REQUEST roles are selected', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            memberRoles: manyRoles,
            selectedRoles: manyRoles.slice(0, MAX_ROLES_PER_REQUEST),
          })}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: 'data_table.select_row' });

      // The first 10 are the selected ones — they must stay interactive so the selection is
      // reversible (parent AC: already-selected items can still be deselected).
      checkboxes.slice(0, MAX_ROLES_PER_REQUEST).forEach((cb) => expect(cb).not.toBeDisabled());
      checkboxes.slice(MAX_ROLES_PER_REQUEST).forEach((cb) => expect(cb).toBeDisabled());
    });

    it('shows the limit message on hover over a disabled checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            memberRoles: manyRoles,
            selectedRoles: manyRoles.slice(0, MAX_ROLES_PER_REQUEST),
          })}
        />,
      );

      const disabled = nth(
        screen.getAllByRole('checkbox', { name: 'data_table.select_row' }),
        MAX_ROLES_PER_REQUEST,
      );
      // Hover the wrapper span, not the checkbox: browsers suppress mouse events originating on a
      // disabled control, which is why the tooltip trigger wraps it.
      await user.hover(tooltipTriggerFor(disabled));

      await waitFor(() => {
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
          'member.detail.roles.max_selection_message',
        );
      });
    });

    it('does not disable any checkbox below the limit', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            memberRoles: manyRoles,
            selectedRoles: manyRoles.slice(0, MAX_ROLES_PER_REQUEST - 1),
          })}
        />,
      );

      screen
        .getAllByRole('checkbox', { name: 'data_table.select_row' })
        .forEach((cb) => expect(cb).not.toBeDisabled());
      expect(
        screen.queryByText('member.detail.roles.max_selection_message'),
      ).not.toBeInTheDocument();
    });

    it('clamps select-all to MAX_ROLES_PER_REQUEST instead of selecting all 50 roles', async () => {
      const user = userEvent.setup();
      const selection = captureSelection<Role>();
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ memberRoles: manyRoles, onSelectedRolesChange: selection.handler })}
        />,
      );

      await user.click(screen.getByRole('checkbox', { name: 'data_table.select_all' }));

      expect(selection.handler).toHaveBeenCalledTimes(1);
      expect(selection.first()).toHaveLength(MAX_ROLES_PER_REQUEST);
    });

    it('keeps an already-selected role past the cap boundary when select-all clamps', async () => {
      const user = userEvent.setup();
      const selection = captureSelection<Role>();
      // Row 40 sits well past the cap, so a naive `slice(0, 10)` would silently discard it.
      const preSelected = nth(manyRoles, 40);
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            memberRoles: manyRoles,
            selectedRoles: [preSelected],
            onSelectedRolesChange: selection.handler,
          })}
        />,
      );

      await user.click(screen.getByRole('checkbox', { name: 'data_table.select_all' }));

      const emitted = selection.first();
      expect(emitted).toHaveLength(MAX_ROLES_PER_REQUEST);
      expect(emitted.map((role) => role.id)).toContain(preSelected.id);
    });

    it('leaves the select-all checkbox enabled when every role is already selected', () => {
      const allTen = manyRoles.slice(0, MAX_ROLES_PER_REQUEST);
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({ memberRoles: allTen, selectedRoles: allTen })}
        />,
      );

      // At the cap *and* fully selected: the click clears the selection, so disabling it here
      // would trap the user with no way out.
      expect(screen.getByRole('checkbox', { name: 'data_table.select_all' })).not.toBeDisabled();
    });

    it('disables the select-all checkbox at the cap while roles remain unselected', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            memberRoles: manyRoles,
            selectedRoles: manyRoles.slice(0, MAX_ROLES_PER_REQUEST),
          })}
        />,
      );

      expect(screen.getByRole('checkbox', { name: 'data_table.select_all' })).toBeDisabled();
    });

    it('ignores the cap for a readonly member, where selection is disabled entirely', () => {
      renderWithProviders(
        <OrganizationMemberEditRolesTab
          {...createProps({
            selectedMember: createMockMember({ access_level: 'readonly' }),
            memberRoles: manyRoles,
            selectedRoles: manyRoles.slice(0, MAX_ROLES_PER_REQUEST),
          })}
        />,
      );

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(
        screen.queryByText('member.detail.roles.max_selection_message'),
      ).not.toBeInTheDocument();
    });
  });
});
