import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationConnectionGroupAssignRolesModal } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-detail/organization-connection-group-assign-roles-modal';
import {
  createMockConnectionGroupDetailRole,
  createMockConnectionGroupDetailRoles,
} from '@/tests/utils/__mocks__/my-organization/connection-group-management/connection-group.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { ConnectionGroupAssignRolesModalProps } from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

const PREFIX = 'assign_modal';
const PLACEHOLDER = `${PREFIX}.roles_placeholder`;

const buildProps = (
  overrides: Partial<ConnectionGroupAssignRolesModalProps> = {},
): ConnectionGroupAssignRolesModalProps => ({
  isOpen: true,
  availableRoles: createMockConnectionGroupDetailRoles(),
  assignedRoles: [],
  onClose: vi.fn(),
  onAssign: vi.fn(),
  ...overrides,
});

describe('OrganizationConnectionGroupAssignRolesModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('renders the dialog with title and buttons when open', () => {
      renderWithProviders(<OrganizationConnectionGroupAssignRolesModal {...buildProps()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(`${PREFIX}.title`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `${PREFIX}.submit_button` })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `${PREFIX}.cancel_button` })).toBeInTheDocument();
    });

    it('renders nothing when closed', () => {
      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ isOpen: false })} />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('excludes already assigned roles from the options', async () => {
      const user = userEvent.setup();
      const admin = createMockConnectionGroupDetailRole({ id: 'rol_admin', name: 'Admin' });
      const member = createMockConnectionGroupDetailRole({ id: 'rol_member', name: 'Member' });

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ assignedRoles: [admin] })} />,
      );
      await user.click(screen.getByPlaceholderText(PLACEHOLDER));

      expect(await screen.findByText(member.name)).toBeInTheDocument();
      expect(screen.queryByText(admin.name)).not.toBeInTheDocument();
    });

    it('shows the no roles message when every role is assigned', () => {
      const availableRoles = createMockConnectionGroupDetailRoles();

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal
          {...buildProps({ availableRoles, assignedRoles: availableRoles })}
        />,
      );

      expect(screen.getByText(`${PREFIX}.no_roles_available`)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(PLACEHOLDER)).not.toBeInTheDocument();
    });

    it('shows search_for_more when server search is enabled and all loaded roles are assigned', async () => {
      const user = userEvent.setup();
      const availableRoles = createMockConnectionGroupDetailRoles();

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal
          {...buildProps({ availableRoles, assignedRoles: availableRoles, onRoleSearch: vi.fn() })}
        />,
      );
      await user.click(screen.getByPlaceholderText(PLACEHOLDER));

      expect(await screen.findByText(`${PREFIX}.search_for_more`)).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('forwards typed queries to onRoleSearch', async () => {
      const onRoleSearch = vi.fn();

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ onRoleSearch })} />,
      );
      fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: 'adm' } });

      await waitFor(() => expect(onRoleSearch).toHaveBeenCalledWith('adm'));
    });

    it('shows the searching message while isSearchingRoles', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal
          {...buildProps({ isSearchingRoles: true, onRoleSearch: vi.fn() })}
        />,
      );
      await user.click(screen.getByPlaceholderText(PLACEHOLDER));

      expect(await screen.findByText(`${PREFIX}.searching_message`)).toBeInTheDocument();
    });

    it('resets the search when the modal closes', () => {
      const onRoleSearch = vi.fn();
      const { rerender } = renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ onRoleSearch })} />,
      );
      onRoleSearch.mockClear();

      rerender(
        <OrganizationConnectionGroupAssignRolesModal
          {...buildProps({ onRoleSearch, isOpen: false })}
        />,
      );

      expect(onRoleSearch).toHaveBeenCalledWith('');
    });
  });

  describe('submit', () => {
    it('disables submit until a role is selected', () => {
      renderWithProviders(<OrganizationConnectionGroupAssignRolesModal {...buildProps()} />);

      expect(screen.getByRole('button', { name: `${PREFIX}.submit_button` })).toBeDisabled();
    });

    it('calls onAssign with the selected role ids', async () => {
      const user = userEvent.setup();
      const onAssign = vi.fn();
      const admin = createMockConnectionGroupDetailRole({ id: 'rol_admin', name: 'Admin' });
      const member = createMockConnectionGroupDetailRole({ id: 'rol_member', name: 'Member' });

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ onAssign })} />,
      );
      await user.click(screen.getByPlaceholderText(PLACEHOLDER));
      await user.click(await screen.findByText(admin.name));
      await user.click(await screen.findByText(member.name));
      await user.click(screen.getByRole('button', { name: `${PREFIX}.submit_button` }));

      expect(onAssign).toHaveBeenCalledTimes(1);
      expect(onAssign).toHaveBeenCalledWith([admin.id, member.id]);
    });
  });

  describe('cancel', () => {
    it('calls onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ onClose })} />,
      );
      await user.click(screen.getByRole('button', { name: `${PREFIX}.cancel_button` }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLoading', () => {
    it('shows a spinner and disables both buttons', () => {
      renderWithProviders(
        <OrganizationConnectionGroupAssignRolesModal {...buildProps({ isLoading: true })} />,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `${PREFIX}.cancel_button` })).toBeDisabled();
      expect(
        screen.queryByRole('button', { name: `${PREFIX}.submit_button` }),
      ).not.toBeInTheDocument();
    });

    it('does not show a spinner when idle', () => {
      renderWithProviders(<OrganizationConnectionGroupAssignRolesModal {...buildProps()} />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('applies classes to the dialog content', () => {
    renderWithProviders(
      <OrganizationConnectionGroupAssignRolesModal
        {...buildProps({
          classes: { 'ConnectionGroupAssignRolesModal-dialogContent': 'custom-x' },
        })}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveClass('custom-x');
  });
});
