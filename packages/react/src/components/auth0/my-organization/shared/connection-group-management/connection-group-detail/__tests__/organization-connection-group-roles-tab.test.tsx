import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationConnectionGroupRolesTab } from '../organization-connection-group-roles-tab';

import { MAX_ROLES_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  createMockConnectionGroupDetailRole,
  createMockConnectionGroupDetailRoles,
} from '@/tests/utils/__mocks__/my-organization/connection-group-management/connection-group.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type {
  ConnectionGroupDetailPermissions,
  ConnectionGroupRolesTabProps,
} from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

const ALL: ConnectionGroupDetailPermissions = {
  canViewRoles: true,
  canAssignRoles: true,
  canRemoveRoles: true,
};

const buildProps = (
  overrides: Partial<ConnectionGroupRolesTabProps> = {},
): ConnectionGroupRolesTabProps => ({
  roles: createMockConnectionGroupDetailRoles(),
  selectedRoles: [],
  permissions: ALL,
  onSelectedRowsChange: vi.fn(),
  onAssignClick: vi.fn(),
  onRemoveClick: vi.fn(),
  ...overrides,
});

describe('OrganizationConnectionGroupRolesTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, description, and role rows', () => {
    renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps()} />);

    expect(screen.getByText('roles.title')).toBeInTheDocument();
    expect(screen.getByText('roles.description')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  it('shows the empty message when there are no roles', () => {
    renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps({ roles: [] })} />);

    expect(screen.getByText('roles.empty_message')).toBeInTheDocument();
  });

  it('calls onAssignClick when Assign Roles is clicked', async () => {
    const user = userEvent.setup();
    const onAssignClick = vi.fn();
    renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps({ onAssignClick })} />);

    await user.click(screen.getByRole('button', { name: /roles.assign_button/ }));

    expect(onAssignClick).toHaveBeenCalledTimes(1);
  });

  it('disables Assign Roles without canAssignRoles', () => {
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab
        {...buildProps({ permissions: { ...ALL, canAssignRoles: false } })}
      />,
    );

    expect(screen.getByRole('button', { name: /roles.assign_button/ })).toBeDisabled();
  });

  it('switches header to selected count and Remove Roles when rows are selected', async () => {
    const user = userEvent.setup();
    const roles = createMockConnectionGroupDetailRoles();
    const onRemoveClick = vi.fn();
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab
        {...buildProps({ roles, selectedRoles: [roles[0]!], onRemoveClick })}
      />,
    );

    expect(screen.getByText('roles.selected_count')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /roles.assign_button/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'roles.remove_button' }));

    expect(onRemoveClick).toHaveBeenCalledWith([roles[0]]);
  });

  it('disables Remove Roles without canRemoveRoles', () => {
    const roles = createMockConnectionGroupDetailRoles();
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab
        {...buildProps({
          roles,
          selectedRoles: [roles[0]!],
          permissions: { ...ALL, canRemoveRoles: false },
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'roles.remove_button' })).toBeDisabled();
  });

  it('calls onSelectedRowsChange when a row checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSelectedRowsChange = vi.fn();
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab {...buildProps({ onSelectedRowsChange })} />,
    );

    const [first] = screen.getAllByRole('checkbox', { name: 'data_table.select_row' });
    await user.click(first!);

    expect(onSelectedRowsChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'rol_admin' }),
    ]);
  });

  it('disables unselected checkboxes once MAX_ROLES_PER_REQUEST roles are selected', () => {
    const roles = Array.from({ length: MAX_ROLES_PER_REQUEST + 1 }, (_, i) =>
      createMockConnectionGroupDetailRole({ id: `rol_${i}`, name: `Role ${i}` }),
    );
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab
        {...buildProps({ roles, selectedRoles: roles.slice(0, MAX_ROLES_PER_REQUEST) })}
      />,
    );

    const boxes = screen.getAllByRole('checkbox', { name: 'data_table.select_row' });
    expect(boxes[MAX_ROLES_PER_REQUEST]).toBeDisabled();
    expect(boxes[0]).not.toBeDisabled();
  });

  it('shows only the first 2 permissions with a +N more overflow', () => {
    const role = createMockConnectionGroupDetailRole({
      permissions: ['a:one', 'b:two', 'c:three', 'd:four'],
    });
    renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps({ roles: [role] })} />);

    expect(screen.getByText('a:one, b:two')).toBeInTheDocument();
    expect(screen.getByText('roles.permissions_overflow')).toBeInTheDocument();
    expect(screen.queryByText(/c:three/)).not.toBeInTheDocument();
  });

  it('shows hidden permissions in the overflow tooltip', async () => {
    const user = userEvent.setup();
    const role = createMockConnectionGroupDetailRole({
      permissions: ['a:one', 'b:two', 'c:three', 'd:four'],
    });
    renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps({ roles: [role] })} />);

    await user.hover(screen.getByText('roles.permissions_overflow'));

    expect((await screen.findAllByText('c:three, d:four')).length).toBeGreaterThan(0);
  });

  it('shows no overflow when permissions fit', () => {
    renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps()} />);

    expect(screen.queryByText('roles.permissions_overflow')).not.toBeInTheDocument();
  });

  it('calls onRemoveClick with the row role when the trash button is clicked', async () => {
    const user = userEvent.setup();
    const roles = createMockConnectionGroupDetailRoles();
    const onRemoveClick = vi.fn();
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab {...buildProps({ roles, onRemoveClick })} />,
    );

    const rows = screen.getAllByRole('row');
    await user.click(within(rows[2]!).getByRole('button', { name: 'roles.remove_button_label' }));

    expect(onRemoveClick).toHaveBeenCalledWith([roles[1]]);
  });

  it('disables trash buttons and hides checkboxes without canRemoveRoles', () => {
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab
        {...buildProps({ permissions: { ...ALL, canRemoveRoles: false } })}
      />,
    );

    screen
      .getAllByRole('button', { name: 'roles.remove_button_label' })
      .forEach((b) => expect(b).toBeDisabled());
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  describe('non-removable (managed) roles', () => {
    it('disables the trash button only for non-removable roles', () => {
      renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps()} />);

      const rows = screen.getAllByRole('row');
      const trash = (i: number) =>
        within(rows[i]!).getByRole('button', { name: 'roles.remove_button_label' });
      expect(trash(1)).toBeEnabled();
      expect(trash(2)).toBeEnabled();
      expect(trash(3)).toBeDisabled();
    });

    it('shows the managed-role tooltip on a non-removable role', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationConnectionGroupRolesTab {...buildProps()} />);

      const rows = screen.getAllByRole('row');
      const trash = within(rows[3]!).getByRole('button', { name: 'roles.remove_button_label' });
      await user.hover(trash.parentElement!);

      expect((await screen.findAllByText('roles.managed_role_tooltip')).length).toBeGreaterThan(0);
    });

    it('prefers the permission-denied tooltip when delete permission is missing', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <OrganizationConnectionGroupRolesTab
          {...buildProps({ permissions: { ...ALL, canRemoveRoles: false } })}
        />,
      );

      const rows = screen.getAllByRole('row');
      const trash = within(rows[3]!).getByRole('button', { name: 'roles.remove_button_label' });
      await user.hover(trash.parentElement!);

      expect((await screen.findAllByText('error.forbidden')).length).toBeGreaterThan(0);
      expect(screen.queryByText('roles.managed_role_tooltip')).not.toBeInTheDocument();
    });

    it('sends only removable roles when bulk Remove Roles is clicked', async () => {
      const user = userEvent.setup();
      const roles = createMockConnectionGroupDetailRoles();
      const onRemoveClick = vi.fn();
      renderWithProviders(
        <OrganizationConnectionGroupRolesTab
          {...buildProps({ roles, selectedRoles: [roles[0]!, roles[2]!], onRemoveClick })}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'roles.remove_button' }));

      expect(onRemoveClick).toHaveBeenCalledWith([roles[0]]);
    });

    it('disables Remove Roles when only non-removable roles are selected', () => {
      const roles = createMockConnectionGroupDetailRoles();
      renderWithProviders(
        <OrganizationConnectionGroupRolesTab
          {...buildProps({ roles, selectedRoles: [roles[2]!] })}
        />,
      );

      expect(screen.getByRole('button', { name: 'roles.remove_button' })).toBeDisabled();
    });
  });

  it('hides assign, remove, trash, and checkboxes in readOnly mode', () => {
    renderWithProviders(
      <OrganizationConnectionGroupRolesTab {...buildProps({ readOnly: true })} />,
    );

    expect(screen.queryByRole('button', { name: /roles.assign_button/ })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'roles.remove_button_label' }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});
