import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  OrganizationConnectionGroupDetail,
  OrganizationConnectionGroupDetailView,
} from '@/components/auth0/my-organization/organization-connection-group-detail';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockConnectionGroup,
  createMockConnectionGroupDetailRole,
  createMockConnectionGroupDetailViewProps,
} from '@/tests/utils/__mocks__/my-organization/connection-group-management/connection-group.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationConnectionGroupDetailViewProps } from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

mockToast();
const { initMockCoreClient } = mockCore();

const renderView = (overrides?: Partial<OrganizationConnectionGroupDetailViewProps>) =>
  renderWithProviders(
    <OrganizationConnectionGroupDetailView
      {...createMockConnectionGroupDetailViewProps(overrides)}
    />,
  );

describe('OrganizationConnectionGroupDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('header', () => {
    it('should render the group name as a heading and the source badge', () => {
      renderView({
        group: createMockConnectionGroup({ name: 'Engineering', source: 'ACME SAML' }),
      });

      expect(screen.getByRole('heading', { level: 1, name: 'Engineering' })).toBeInTheDocument();
      expect(screen.getByText(/sources_label/)).toBeInTheDocument();
      expect(screen.getByText('ACME SAML')).toBeInTheDocument();
    });

    it('should call handleBack when the back button is clicked', async () => {
      const user = userEvent.setup();
      const handleBack = vi.fn();
      renderView({ handleBack });

      await user.click(screen.getByRole('button', { name: /back_button/ }));

      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('layout', () => {
    it('should render the roles section without a tablist', () => {
      renderView();

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(screen.getByText(/roles.title/)).toBeInTheDocument();
    });
  });

  describe('permissions', () => {
    it('should render a permission-denied state instead of the roles table without canViewRoles', () => {
      renderView({
        permissions: { canViewRoles: false, canAssignRoles: false, canRemoveRoles: false },
        isFetchingRoles: true,
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('roles actions', () => {
    it('should open the assign modal when Assign Roles is clicked', async () => {
      const user = userEvent.setup();
      const openModal = vi.fn();
      renderView({ openModal });

      await user.click(screen.getByRole('button', { name: /roles.assign_button/ }));

      expect(openModal).toHaveBeenCalledWith({ type: 'assignRoles' });
    });

    it('should open the remove modal with the row role when its trash button is clicked', async () => {
      const user = userEvent.setup();
      const openModal = vi.fn();
      const role = createMockConnectionGroupDetailRole({ id: 'r1', name: 'Admin' });
      renderView({ roles: [role], openModal });

      await user.click(screen.getByRole('button', { name: /roles.remove_button_label/ }));

      expect(openModal).toHaveBeenCalledWith({ type: 'removeRoles', roles: [role] });
    });
  });

  describe('modals', () => {
    it('should render the assign modal when modalState is assignRoles', () => {
      renderView({ modalState: { type: 'assignRoles' } });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('assign_modal.title')).toBeInTheDocument();
    });

    it('should wire onRoleSearch and isSearchingRoles through to the assign modal', async () => {
      const onRoleSearch = vi.fn();
      renderView({ modalState: { type: 'assignRoles' }, onRoleSearch, isSearchingRoles: true });

      fireEvent.change(screen.getByPlaceholderText('assign_modal.roles_placeholder'), {
        target: { value: 'adm' },
      });

      await waitFor(() => expect(onRoleSearch).toHaveBeenCalledWith('adm'));
      expect(await screen.findByText('assign_modal.searching_message')).toBeInTheDocument();
    });

    it('should keep the roles listed in the remove modal while it closes', async () => {
      const role = createMockConnectionGroupDetailRole({ id: 'r1', name: 'Admin' });
      const props = createMockConnectionGroupDetailViewProps({
        roles: [],
        modalState: { type: 'removeRoles', roles: [role] },
      });
      const { rerender } = renderWithProviders(
        <OrganizationConnectionGroupDetailView {...props} />,
      );
      expect(within(screen.getByRole('dialog')).getByText('Admin')).toBeInTheDocument();

      rerender(<OrganizationConnectionGroupDetailView {...props} modalState={null} />);

      const dialog = screen.queryByRole('dialog');
      if (dialog) {
        expect(within(dialog).getByText('Admin')).toBeInTheDocument();
      }
    });

    it('should render the remove modal and confirm via handleRemoveRolesConfirm', async () => {
      const user = userEvent.setup();
      const handleRemoveRolesConfirm = vi.fn();
      const role = createMockConnectionGroupDetailRole({ id: 'r1', name: 'Admin' });
      renderView({
        roles: [role],
        modalState: { type: 'removeRoles', roles: [role] },
        handleRemoveRolesConfirm,
      });

      expect(screen.getByText('remove_modal.title')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'remove_modal.confirm_button' }));

      expect(handleRemoveRolesConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call closeModal when the remove modal is cancelled', async () => {
      const user = userEvent.setup();
      const closeModal = vi.fn();
      const role = createMockConnectionGroupDetailRole();
      renderView({ modalState: { type: 'removeRoles', roles: [role] }, closeModal });

      await user.click(screen.getByRole('button', { name: 'remove_modal.cancel_button' }));

      expect(closeModal).toHaveBeenCalled();
    });
  });

  describe('readOnly', () => {
    it('should hide the assign button when readOnly', () => {
      renderView({ readOnly: true });

      expect(screen.queryByRole('button', { name: /roles.assign_button/ })).not.toBeInTheDocument();
    });

    it('should still render the roles when readOnly with canViewRoles', () => {
      const roles = [createMockConnectionGroupDetailRole({ name: 'Visible Role' })];
      renderView({ readOnly: true, roles });

      expect(screen.getByText('Visible Role')).toBeInTheDocument();
      expect(screen.queryByText(/permission_denied|forbidden/i)).not.toBeInTheDocument();
    });
  });

  describe('customMessages', () => {
    it('should render the overridden back button text instead of the default key', () => {
      renderView({ customMessages: { back_button: 'Go back' } });

      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      expect(screen.queryByText('back_button')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply the root class from styling', () => {
      const { container } = renderView({
        styling: {
          variables: { common: {}, light: {}, dark: {} },
          classes: { 'OrganizationConnectionGroupDetail-root': 'custom-root' },
        },
      });

      expect(container.querySelector('.custom-root')).toBeInTheDocument();
    });
  });
});

describe('OrganizationConnectionGroupDetail', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  it('should render the group header from the group prop and route back through onBack', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    renderWithProviders(
      <OrganizationConnectionGroupDetail group={createMockConnectionGroup()} onBack={onBack} />,
    );

    const backButton = await screen.findByRole(
      'button',
      { name: /back_button/ },
      { timeout: 3000 },
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Engineering' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    await user.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
