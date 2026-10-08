import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { OrganizationConnectionGroupTableView } from '@/components/auth0/my-organization/organization-connection-group-table';
import {
  READ_ONLY_CONNECTION_GROUP_PERMISSIONS,
  createMockConnectionGroup,
  createMockConnectionGroupRole,
  createMockConnectionGroupTableViewProps,
} from '@/tests/utils/__mocks__/my-organization/connection-group/connection-group-table-mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';
import type { OrganizationConnectionGroupTableViewProps } from '@/types/my-organization/connection-group/organization-connection-group-table-types';

mockToast();

const renderView = (overrides?: Partial<OrganizationConnectionGroupTableViewProps>) =>
  renderWithProviders(
    <OrganizationConnectionGroupTableView
      {...createMockConnectionGroupTableViewProps(overrides)}
    />,
  );

describe('OrganizationConnectionGroupTableView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('table display', () => {
    it('should render a group row with its name, source, and assigned role', () => {
      renderView({
        groups: [
          createMockConnectionGroup({
            name: 'Engineering',
            source: 'ACME SAML',
            assignedRoles: [createMockConnectionGroupRole({ id: 'r1', name: 'Admin' })],
          }),
        ],
      });

      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('ACME SAML')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render the empty state when there are no groups', () => {
      renderView({ groups: [] });

      expect(screen.getByText(/table.empty_message/i)).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('should render the header by default', () => {
      renderView();

      expect(screen.getByText(/header.title/i)).toBeInTheDocument();
    });

    it('should hide the header when hideHeader is true', () => {
      renderView({ hideHeader: true });

      expect(screen.queryByText(/header.title/i)).not.toBeInTheDocument();
    });
  });

  describe('assigned roles', () => {
    it('should show the empty indicator when a group has no roles', () => {
      renderView({ groups: [createMockConnectionGroup({ assignedRoles: [] })] });

      expect(screen.getByText(/table.assigned_roles_empty/i)).toBeInTheDocument();
    });

    it('should collapse roles beyond maxVisibleRoles into a "+N more" overflow', () => {
      renderView({
        maxVisibleRoles: 2,
        groups: [
          createMockConnectionGroup({
            assignedRoles: [
              createMockConnectionGroupRole({ id: 'r1', name: 'Admin' }),
              createMockConnectionGroupRole({ id: 'r2', name: 'Viewer' }),
              createMockConnectionGroupRole({ id: 'r3', name: 'Editor' }),
            ],
          }),
        ],
      });

      // First two roles are shown inline; the third collapses into the overflow label.
      expect(screen.getByText('Admin, Viewer')).toBeInTheDocument();
      expect(screen.getByText(/table.assigned_roles_overflow/i)).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('should sort rows by name when the name header is clicked', async () => {
      const user = userEvent.setup();
      renderView({
        groups: [
          createMockConnectionGroup({ id: 'g1', name: 'Zebra', assignedRoles: [] }),
          createMockConnectionGroup({ id: 'g2', name: 'Alpha', assignedRoles: [] }),
        ],
      });

      // Unsorted: input order is preserved (Zebra first).
      const initialRows = screen.getAllByRole('row');
      expect(within(initialRows[1]!).getByText('Zebra')).toBeInTheDocument();

      await user.click(screen.getByText('table.columns.name'));

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(within(rows[1]!).getByText('Alpha')).toBeInTheDocument();
      });
    });
  });

  describe('row actions', () => {
    it('should fire onViewDetails and onAssignRoles for the row group', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();
      const onAssignRoles = vi.fn();
      const group = createMockConnectionGroup({ id: 'g1', name: 'Engineering' });

      renderView({ groups: [group], onViewDetails, onAssignRoles });

      await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

      await user.click(screen.getByRole('menuitem', { name: /table.actions.view_details/i }));
      expect(onViewDetails).toHaveBeenCalledWith(group);

      await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));
      await user.click(screen.getByRole('menuitem', { name: /table.actions.assign_roles/i }));
      expect(onAssignRoles).toHaveBeenCalledWith(group);
    });

    it('should not render the actions menu when no action handlers are provided', () => {
      renderView({ onViewDetails: undefined, onAssignRoles: undefined });

      expect(
        screen.queryByRole('button', { name: 'table.actions.menu_label' }),
      ).not.toBeInTheDocument();
    });

    it('should hide the assign-roles item when role management is not permitted', async () => {
      const user = userEvent.setup();

      renderView({
        permissions: READ_ONLY_CONNECTION_GROUP_PERMISSIONS,
        onViewDetails: vi.fn(),
        onAssignRoles: vi.fn(),
      });

      await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

      expect(
        screen.getByRole('menuitem', { name: /table.actions.view_details/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: /table.actions.assign_roles/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply a custom class to the header wrapper', () => {
      const { container } = renderView({
        styling: {
          variables: { common: {}, light: {}, dark: {} },
          classes: { 'OrganizationConnectionGroupTable-header': 'custom-header-class' },
        },
      });

      expect(container.querySelector('.custom-header-class')).toBeInTheDocument();
    });
  });
});
