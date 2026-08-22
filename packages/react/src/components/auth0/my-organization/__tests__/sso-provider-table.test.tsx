import {
  idpConfigQueryKeys,
  type ComponentAction,
  type IdpKnownResponse,
} from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderTable } from '@/components/auth0/my-organization/sso-provider-table';
import * as useConfigModule from '@/hooks/my-organization/shared/services/use-config-service';
import * as useIdpConfigModule from '@/hooks/my-organization/shared/services/use-idp-config-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createMockIdentityProvider } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { createTestQueryClient, renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { SsoProviderTableProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

mockToast();
const { initMockCoreClient } = mockCore();

const createMockSsoProviderTableProps = (
  overrides?: Partial<SsoProviderTableProps>,
): SsoProviderTableProps => ({
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  createAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
  editAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
  deleteAction: undefined,
  deleteFromOrganizationAction: {},
  enableProviderAction: undefined,
  ...overrides,
});

const createMockCreateAction = (): ComponentAction<void> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockEditAction = (): ComponentAction<IdpKnownResponse> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockDeleteAction = (): ComponentAction<IdpKnownResponse> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockDeleteFromOrganizationAction = (): ComponentAction<IdpKnownResponse> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
};

const createMockIdpConfig = () => ({
  organization: {
    can_set_show_as_button: true,
    can_set_assign_membership_on_login: true,
  },
  strategies: {
    adfs: { enabled_features: [], provisioning_methods: [] },
    googleapps: { enabled_features: [], provisioning_methods: [] },
    oidc: { enabled_features: [], provisioning_methods: [] },
    okta: { enabled_features: [], provisioning_methods: [] },
    pingfederate: { enabled_features: [], provisioning_methods: [] },
    samlp: { enabled_features: [], provisioning_methods: [] },
    waad: { enabled_features: [], provisioning_methods: [] },
  },
});

describe('SsoProviderTable', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let queryClient: QueryClient;

  const renderTable = (overrides?: Partial<SsoProviderTableProps>) =>
    renderWithProviders(<SsoProviderTable {...createMockSsoProviderTableProps(overrides)} />, {
      queryClient,
    });

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(idpConfigQueryKeys.config(), createMockIdpConfig());

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      identity_providers: [mockProvider],
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(createMockUseConfig());

    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(createMockUseIdpConfig());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('customMessages', () => {
    describe('when using custom message on header title', () => {
      it('should override header title', async () => {
        const customMessages = {
          header: {
            title: 'Custom SSO Providers',
          },
        };

        renderTable({ customMessages });

        await waitForComponentToLoad();

        expect(screen.getByText('Custom SSO Providers')).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for SsoProviderTable-header', () => {
        it('should apply the custom class to SsoProviderTable-header', async () => {
          const customStyling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              'SsoProviderTable-header': 'custom-header-class',
            },
          };

          const { container } = renderTable({ styling: customStyling });

          await waitForComponentToLoad();

          const headerElement = container.querySelector('.custom-header-class');
          expect(headerElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should not render the create button', async () => {
        renderTable({ readOnly: true });

        await waitForComponentToLoad();

        expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
      });

      it('should not render any row action, including the toggle', async () => {
        renderTable({ readOnly: true });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /menu/i })).not.toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should enable action buttons', async () => {
        renderTable({ readOnly: false });

        await waitForComponentToLoad();

        const createButton = screen.getByRole('button', { name: /create/i });
        expect(createButton).not.toBeDisabled();
      });
    });
  });

  describe('createAction', () => {
    describe('createAction.disabled', () => {
      describe('when is true', () => {
        it('should disable create button', async () => {
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = true;

          renderTable({ createAction: mockCreateAction });

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          expect(createButton).toBeDisabled();
        });
      });

      describe('when is false', () => {
        it('should enable create button', async () => {
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = false;

          renderTable({ createAction: mockCreateAction });

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          expect(createButton).not.toBeDisabled();
        });
      });
    });

    describe('createAction.onAfter', () => {
      describe('when create button is clicked', () => {
        it('should call onAfter', async () => {
          const user = userEvent.setup();
          const mockCreateAction = createMockCreateAction();

          renderTable({ createAction: mockCreateAction });

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          await user.click(createButton);

          expect(mockCreateAction.onAfter).toHaveBeenCalled();
        });
      });
    });
  });

  describe('editAction', () => {
    describe('editAction.disabled', () => {
      describe('when is true', () => {
        it('should disable edit button', async () => {
          const user = userEvent.setup();
          const mockEditAction = createMockEditAction();
          mockEditAction.disabled = true;

          renderTable({ editAction: mockEditAction });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const editMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.edit_button_text/i,
          });
          expect(editMenuItem).toHaveAttribute('aria-disabled', 'true');
        });
      });

      describe('when is false', () => {
        it('should enable edit button', async () => {
          const user = userEvent.setup();
          const mockEditAction = createMockEditAction();
          mockEditAction.disabled = false;

          renderTable({ editAction: mockEditAction });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const editMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.edit_button_text/i,
          });
          expect(editMenuItem).not.toHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    describe('editAction.onAfter', () => {
      describe('when provider is edited', () => {
        it('should call onAfter with provider data', async () => {
          const user = userEvent.setup();
          const mockEditAction = createMockEditAction();

          renderTable({ editAction: mockEditAction });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const editMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.edit_button_text/i,
          });
          await user.click(editMenuItem);

          // onAfter should be called with the provider data
          expect(mockEditAction.onAfter).toHaveBeenCalledWith(mockProvider);
        });
      });
    });
  });

  describe('deleteAction', () => {
    describe('deleteAction.disabled', () => {
      describe('when is true', () => {
        it('should render no row actions menu when readOnly is true', async () => {
          const mockDeleteAction = createMockDeleteAction();
          mockDeleteAction.disabled = true;

          renderTable({
            deleteAction: mockDeleteAction,
            readOnly: true,
          });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          expect(
            screen.queryByRole('button', { name: 'table.actions.menu_label' }),
          ).not.toBeInTheDocument();
        });
      });

      describe('when is false', () => {
        it('should enable delete button', async () => {
          const user = userEvent.setup();
          const mockDeleteAction = createMockDeleteAction();
          mockDeleteAction.disabled = false;

          renderTable({ deleteAction: mockDeleteAction });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const deleteMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.delete_button_text/i,
          });
          expect(deleteMenuItem).not.toHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    describe('deleteAction.onBefore', () => {
      describe('when user deletes provider', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with delete modal', async () => {
            const user = userEvent.setup();
            const mockDeleteAction = createMockDeleteAction();
            mockDeleteAction.onBefore = vi.fn(() => true);

            renderTable({ deleteAction: mockDeleteAction });

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

            const deleteMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.delete_button_text/i,
            });
            await user.click(deleteMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteAction.onBefore).toHaveBeenCalledWith(mockProvider);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with delete modal', async () => {
            const user = userEvent.setup();
            const mockDeleteAction = createMockDeleteAction();
            mockDeleteAction.onBefore = vi.fn(() => false);

            renderTable({ deleteAction: mockDeleteAction });

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

            const deleteMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.delete_button_text/i,
            });
            await user.click(deleteMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteAction.onBefore).toHaveBeenCalledWith(mockProvider);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
          });
        });
      });
    });

    describe('deleteAction.onAfter', () => {
      describe('when delete is successful', () => {
        it('should call onAfter after confirming delete in modal', async () => {
          const user = userEvent.setup();
          const mockDeleteAction = createMockDeleteAction();

          renderTable({ deleteAction: mockDeleteAction });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const deleteMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.delete_button_text/i,
          });
          await user.click(deleteMenuItem);

          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
          });

          const input = screen.getByRole('textbox');
          await user.type(input, mockProvider.name!);

          const confirmButton = screen.getByRole('button', {
            name: /delete_modal.confirm_button_text|confirm|delete/i,
          });
          await user.click(confirmButton);

          // onAfter should be called after successful deletion
          await waitFor(() => {
            expect(mockDeleteAction.onAfter).toHaveBeenCalledWith(mockProvider);
          });
        });
      });
    });
  });

  describe('deleteFromOrganizationAction', () => {
    describe('deleteFromOrganizationAction.disabled', () => {
      describe('when is true', () => {
        it('should render no row actions menu when readOnly is true', async () => {
          const mockDeleteFromOrganizationAction = createMockDeleteFromOrganizationAction();
          mockDeleteFromOrganizationAction.disabled = true;

          renderTable({
            deleteFromOrganizationAction: mockDeleteFromOrganizationAction,
            readOnly: true,
          });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          expect(
            screen.queryByRole('button', { name: 'table.actions.menu_label' }),
          ).not.toBeInTheDocument();
        });
      });

      describe('when is false', () => {
        it('should enable remove from organization button', async () => {
          const user = userEvent.setup();
          const mockDeleteFromOrganizationAction = createMockDeleteFromOrganizationAction();
          mockDeleteFromOrganizationAction.disabled = false;

          renderTable({
            deleteFromOrganizationAction: mockDeleteFromOrganizationAction,
          });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const removeMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.remove_button_text/i,
          });
          expect(removeMenuItem).not.toHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    describe('deleteFromOrganizationAction.onBefore', () => {
      describe('when user removes provider from organization', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with removal modal', async () => {
            const user = userEvent.setup();
            const mockDeleteFromOrganizationAction = createMockDeleteFromOrganizationAction();
            mockDeleteFromOrganizationAction.onBefore = vi.fn(() => true);

            renderTable({
              deleteFromOrganizationAction: mockDeleteFromOrganizationAction,
            });

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

            const removeMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.remove_button_text/i,
            });
            await user.click(removeMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteFromOrganizationAction.onBefore).toHaveBeenCalledWith(mockProvider);

            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with removal modal', async () => {
            const user = userEvent.setup();
            const mockDeleteFromOrganizationAction = createMockDeleteFromOrganizationAction();
            mockDeleteFromOrganizationAction.onBefore = vi.fn(() => false);

            renderTable({
              deleteFromOrganizationAction: mockDeleteFromOrganizationAction,
            });

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

            const removeMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.remove_button_text/i,
            });
            await user.click(removeMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteFromOrganizationAction.onBefore).toHaveBeenCalledWith(mockProvider);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
          });
        });
      });
    });

    describe('deleteFromOrganizationAction.onAfter', () => {
      describe('when removal is successful', () => {
        it('should call onAfter after confirming removal in modal', async () => {
          const user = userEvent.setup();
          const mockDeleteFromOrganizationAction = createMockDeleteFromOrganizationAction();

          renderTable({
            deleteFromOrganizationAction: mockDeleteFromOrganizationAction,
          });

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          const removeMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.remove_button_text/i,
          });
          await user.click(removeMenuItem);

          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
          });

          const input = screen.getByRole('textbox');
          await user.type(input, mockProvider.name!);

          const confirmButton = screen.getByRole('button', {
            name: /remove_modal.confirm_button_text|confirm|remove/i,
          });
          await user.click(confirmButton);

          // onAfter should be called after successful removal
          await waitFor(() => {
            expect(
              mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.detach,
            ).toHaveBeenCalled();
            expect(mockDeleteFromOrganizationAction.onAfter).toHaveBeenCalledWith(mockProvider);
          });
        });
      });
    });
  });

  describe('enableProviderAction', () => {
    describe('when user toggles provider enabled state', () => {
      it('should call enableProviderAction callbacks when toggling switch', async () => {
        const user = userEvent.setup();
        const enableProviderAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderTable({ enableProviderAction });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toBeInTheDocument();

        await user.click(toggleSwitch);

        // onBefore should be called with the provider data
        await waitFor(() => {
          expect(enableProviderAction.onBefore).toHaveBeenCalledWith(mockProvider);
        });

        await waitFor(() => {
          expect(
            mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
          ).toHaveBeenCalled();
        });

        // onAfter should be called after successful update
        await waitFor(() => {
          expect(enableProviderAction.onAfter).toHaveBeenCalledWith(mockProvider);
        });
      });

      it('should not proceed when onBefore returns false', async () => {
        const user = userEvent.setup();
        const enableProviderAction = {
          disabled: false,
          onBefore: vi.fn(() => false),
          onAfter: vi.fn(),
        };

        renderTable({ enableProviderAction });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toBeInTheDocument();

        await user.click(toggleSwitch);

        // onBefore should be called
        await waitFor(() => {
          expect(enableProviderAction.onBefore).toHaveBeenCalledWith(mockProvider);
        });

        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
        ).not.toHaveBeenCalled();

        // onAfter should NOT be called
        expect(enableProviderAction.onAfter).not.toHaveBeenCalled();
      });

      it('should not render the toggle switch when readOnly is true', async () => {
        const enableProviderAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderTable({ enableProviderAction, readOnly: true });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      });
    });
  });

  describe('table display', () => {
    describe('when providers are loaded', () => {
      it('should display provider information in table', async () => {
        renderTable();

        await waitForComponentToLoad();

        await waitFor(() => {
          expect(screen.getByText(mockProvider.name!)).toBeInTheDocument();
        });
      });

      it('should display provider display name', async () => {
        renderTable();

        await waitForComponentToLoad();

        await waitFor(() => {
          expect(screen.getByText(mockProvider.display_name!)).toBeInTheDocument();
        });
      });

      it('should display provider in a table', async () => {
        renderTable();

        await waitForComponentToLoad();

        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    describe('when no providers exist', () => {
      it('should display empty state', async () => {
        const apiService = mockCoreClient.getMyOrganizationApiClient();
        (
          apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>
        ).mockResolvedValue({
          identity_providers: [],
        });

        renderTable();

        await waitForComponentToLoad();

        expect(screen.getByText(/table.empty_message/i)).toBeInTheDocument();
      });

      it('should still display header when no providers exist', async () => {
        const apiService = mockCoreClient.getMyOrganizationApiClient();
        (
          apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>
        ).mockResolvedValue({
          identity_providers: [],
        });

        renderTable();

        await waitForComponentToLoad();

        expect(screen.getByText(/header.title/i)).toBeInTheDocument();
      });
    });
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header', async () => {
        renderTable();

        await waitForComponentToLoad();

        expect(screen.getByText(/header.title/i)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    describe('when API fails to load providers', () => {
      it('should handle error gracefully', async () => {
        const apiService = mockCoreClient.getMyOrganizationApiClient();
        (
          apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>
        ).mockRejectedValue(new Error('Failed to load providers'));

        renderTable();

        await waitForComponentToLoad();

        // Component should still render despite error
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });
    });
  });

  describe('hideDeleteProvider', () => {
    describe('when is true', () => {
      it('should not render delete action in dropdown menu', async () => {
        const user = userEvent.setup();

        renderTable({ hideDeleteProvider: true });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(
          screen.queryByRole('menuitem', { name: /table.actions.delete_button_text/i }),
        ).not.toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should render delete action in dropdown menu', async () => {
        const user = userEvent.setup();

        renderTable({ hideDeleteProvider: false });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(
          screen.queryByRole('menuitem', { name: /table.actions.delete_button_text/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('hideRemoveFromOrganization', () => {
    describe('when is true', () => {
      it('should not render remove from organization action in dropdown menu', async () => {
        const user = userEvent.setup();

        renderTable({ hideRemoveFromOrganization: true });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(
          screen.queryByRole('menuitem', { name: /table.actions.remove_button_text/i }),
        ).not.toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should render remove from organization action in dropdown menu', async () => {
        const user = userEvent.setup();

        renderTable({ hideRemoveFromOrganization: false });

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(
          screen.queryByRole('menuitem', { name: /table.actions.remove_button_text/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
