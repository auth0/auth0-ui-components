import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationConnectionGroupTableActionsColumn } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-table/organization-connection-group-table-actions-column';
import {
  ALL_CONNECTION_GROUP_PERMISSIONS,
  READ_ONLY_CONNECTION_GROUP_PERMISSIONS,
  createMockConnectionGroup,
} from '@/tests/utils/__mocks__/my-organization/connection-group/connection-group-table-mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { OrganizationConnectionGroupTableActionsColumnProps } from '@/types/my-organization/connection-group/organization-connection-group-table-types';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

function createProps(
  overrides: Partial<OrganizationConnectionGroupTableActionsColumnProps> = {},
): OrganizationConnectionGroupTableActionsColumnProps {
  return {
    group: createMockConnectionGroup(),
    permissions: ALL_CONNECTION_GROUP_PERMISSIONS,
    customMessages: {},
    onAssignRoles: vi.fn(),
    onViewDetails: vi.fn(),
    ...overrides,
  };
}

describe('OrganizationConnectionGroupTableActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the menu trigger when at least one action is available', () => {
    renderWithProviders(<OrganizationConnectionGroupTableActionsColumn {...createProps()} />);

    expect(screen.getByRole('button', { name: 'table.actions.menu_label' })).toBeInTheDocument();
  });

  it('should render nothing when no action handlers are provided', () => {
    const { container } = renderWithProviders(
      <OrganizationConnectionGroupTableActionsColumn
        {...createProps({ onAssignRoles: undefined, onViewDetails: undefined })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when only assign-roles is wired but role management is denied', () => {
    const { container } = renderWithProviders(
      <OrganizationConnectionGroupTableActionsColumn
        {...createProps({
          permissions: READ_ONLY_CONNECTION_GROUP_PERMISSIONS,
          onViewDetails: undefined,
          onAssignRoles: vi.fn(),
        })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should call onViewDetails with the group', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    const group = createMockConnectionGroup({ id: 'g1' });

    renderWithProviders(
      <OrganizationConnectionGroupTableActionsColumn {...createProps({ group, onViewDetails })} />,
    );

    await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));
    await user.click(screen.getByRole('menuitem', { name: /table.actions.view_details/i }));

    expect(onViewDetails).toHaveBeenCalledWith(group);
  });

  it('should call onAssignRoles with the group', async () => {
    const user = userEvent.setup();
    const onAssignRoles = vi.fn();
    const group = createMockConnectionGroup({ id: 'g1' });

    renderWithProviders(
      <OrganizationConnectionGroupTableActionsColumn {...createProps({ group, onAssignRoles })} />,
    );

    await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));
    await user.click(screen.getByRole('menuitem', { name: /table.actions.assign_roles/i }));

    expect(onAssignRoles).toHaveBeenCalledWith(group);
  });

  it('should not render the assign-roles item when role management is denied', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <OrganizationConnectionGroupTableActionsColumn
        {...createProps({ permissions: READ_ONLY_CONNECTION_GROUP_PERMISSIONS })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

    expect(
      screen.getByRole('menuitem', { name: /table.actions.view_details/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: /table.actions.assign_roles/i }),
    ).not.toBeInTheDocument();
  });
});
