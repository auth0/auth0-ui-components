import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationConnectionGroupRemoveRolesModal } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-detail/organization-connection-group-remove-roles-modal';
import { createMockConnectionGroupDetailRoles } from '@/tests/utils/__mocks__/my-organization/connection-group-management/connection-group.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { ConnectionGroupRemoveRolesModalProps } from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

const PREFIX = 'remove_modal';

const buildProps = (
  overrides: Partial<ConnectionGroupRemoveRolesModalProps> = {},
): ConnectionGroupRemoveRolesModalProps => ({
  isOpen: true,
  roles: createMockConnectionGroupDetailRoles(),
  groupName: 'Engineering',
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});

describe('OrganizationConnectionGroupRemoveRolesModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and buttons when open', () => {
    renderWithProviders(<OrganizationConnectionGroupRemoveRolesModal {...buildProps()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(`${PREFIX}.title`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${PREFIX}.confirm_button` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${PREFIX}.cancel_button` })).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    renderWithProviders(
      <OrganizationConnectionGroupRemoveRolesModal {...buildProps({ isOpen: false })} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists every role being removed', () => {
    const roles = createMockConnectionGroupDetailRoles();

    renderWithProviders(<OrganizationConnectionGroupRemoveRolesModal {...buildProps({ roles })} />);

    roles.forEach((role) => expect(screen.getByText(role.name)).toBeInTheDocument());
  });

  it('calls onConfirm when confirm is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    renderWithProviders(
      <OrganizationConnectionGroupRemoveRolesModal {...buildProps({ onConfirm })} />,
    );
    await user.click(screen.getByRole('button', { name: `${PREFIX}.confirm_button` }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <OrganizationConnectionGroupRemoveRolesModal {...buildProps({ onClose })} />,
    );
    await user.click(screen.getByRole('button', { name: `${PREFIX}.cancel_button` }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and disables buttons while loading', () => {
    renderWithProviders(
      <OrganizationConnectionGroupRemoveRolesModal {...buildProps({ isLoading: true })} />,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${PREFIX}.cancel_button` })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: `${PREFIX}.confirm_button` }),
    ).not.toBeInTheDocument();
  });

  it('applies classes to the dialog content', () => {
    renderWithProviders(
      <OrganizationConnectionGroupRemoveRolesModal
        {...buildProps({
          classes: { 'ConnectionGroupRemoveRolesModal-dialogContent': 'custom-x' },
        })}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveClass('custom-x');
  });
});
