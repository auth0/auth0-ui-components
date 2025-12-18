import type { ComponentAction, IdentityProvider } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useConfigModule from '../../../../hooks/my-organization/config/use-config';
import * as useCoreClientModule from '../../../../hooks/use-core-client';
import { createMockIdentityProvider } from '../../../../internals/__mocks__/my-organization/domain-management/domain.mocks';
import { renderWithProviders } from '../../../../internals/test-provider';
import { mockCore, mockToast } from '../../../../internals/test-setup';
import type { SsoProviderTableProps } from '../../../../types/my-organization/idp-management/sso-provider/sso-provider-table-types';
import { SsoProviderTable } from '../sso-provider-table';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

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
  deleteFromOrgAction: undefined,
  enableProviderAction: undefined,
  ...overrides,
});

const createMockCreateAction = (): ComponentAction<void> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockEditAction = (): ComponentAction<IdentityProvider> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockDeleteAction = (): ComponentAction<IdentityProvider> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockDeleteFromOrgAction = (): ComponentAction<IdentityProvider> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
};

// ===== Tests =====

describe('SsoProviderTable', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      identity_providers: [mockProvider],
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue({
      isLoadingConfig: false,
      shouldAllowDeletion: true,
      isConfigValid: true,
      config: { connection_deletion_behavior: 'allow', allowed_strategies: [] },
      fetchConfig: vi.fn(),
      filteredStrategies: [],
    });
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

        renderWithProviders(
          <SsoProviderTable {...createMockSsoProviderTableProps({ customMessages })} />,
        );

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

          const { container } = renderWithProviders(
            <SsoProviderTable {...createMockSsoProviderTableProps({ styling: customStyling })} />,
          );

          await waitForComponentToLoad();

          const headerElement = container.querySelector('.custom-header-class');
          expect(headerElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should disable action buttons', async () => {
        renderWithProviders(
          <SsoProviderTable {...createMockSsoProviderTableProps({ readOnly: true })} />,
        );

        await waitForComponentToLoad();

        const createButton = screen.getByRole('button', { name: /create/i });
        expect(createButton).toBeDisabled();
      });
    });

    describe('when is false', () => {
      it('should enable action buttons', async () => {
        renderWithProviders(
          <SsoProviderTable {...createMockSsoProviderTableProps({ readOnly: false })} />,
        );

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

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ createAction: mockCreateAction })}
            />,
          );

          await waitForComponentToLoad();

          const createButton = screen.getByRole('button', { name: /create/i });
          expect(createButton).toBeDisabled();
        });
      });

      describe('when is false', () => {
        it('should enable create button', async () => {
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = false;

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ createAction: mockCreateAction })}
            />,
          );

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

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ createAction: mockCreateAction })}
            />,
          );

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

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ editAction: mockEditAction })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Edit menu item should be disabled
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

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ editAction: mockEditAction })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Edit menu item should not be disabled
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

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ editAction: mockEditAction })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Click the edit menu item
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
        it('should disable delete button in the dropdown when readOnly is true', async () => {
          const user = userEvent.setup();
          const mockDeleteAction = createMockDeleteAction();
          mockDeleteAction.disabled = true;

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({
                deleteAction: mockDeleteAction,
                readOnly: true,
              })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Delete menu item should be disabled when readOnly is true
          const deleteMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.delete_button_text/i,
          });
          expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');
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

            renderWithProviders(
              <SsoProviderTable
                {...createMockSsoProviderTableProps({ deleteAction: mockDeleteAction })}
              />,
            );

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            // Open the dropdown menu for the row
            const actionButtons = screen.getAllByRole('button');
            const rowActionButton = actionButtons.find(
              (btn) =>
                btn.querySelector('svg.lucide-more-horizontal') ||
                btn.className.includes('rounded-xl'),
            );
            expect(rowActionButton).toBeDefined();
            await user.click(rowActionButton!);

            // Click the delete menu item
            const deleteMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.delete_button_text/i,
            });
            await user.click(deleteMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteAction.onBefore).toHaveBeenCalledWith(mockProvider);

            // Delete modal should be shown
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

            renderWithProviders(
              <SsoProviderTable
                {...createMockSsoProviderTableProps({ deleteAction: mockDeleteAction })}
              />,
            );

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            // Open the dropdown menu for the row
            const actionButtons = screen.getAllByRole('button');
            const rowActionButton = actionButtons.find(
              (btn) =>
                btn.querySelector('svg.lucide-more-horizontal') ||
                btn.className.includes('rounded-xl'),
            );
            expect(rowActionButton).toBeDefined();
            await user.click(rowActionButton!);

            // Click the delete menu item
            const deleteMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.delete_button_text/i,
            });
            await user.click(deleteMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteAction.onBefore).toHaveBeenCalledWith(mockProvider);

            // Delete modal should NOT be shown
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

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({ deleteAction: mockDeleteAction })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Click the delete menu item
          const deleteMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.delete_button_text/i,
          });
          await user.click(deleteMenuItem);

          // Delete modal should be shown
          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
          });

          // Type provider name to confirm
          const input = screen.getByRole('textbox');
          await user.type(input, mockProvider.name!);

          // Find and click the confirm delete button in the modal
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

  describe('deleteFromOrgAction', () => {
    describe('deleteFromOrgAction.disabled', () => {
      describe('when is true', () => {
        it('should disable remove from organization button when readOnly is true', async () => {
          const user = userEvent.setup();
          const mockDeleteFromOrgAction = createMockDeleteFromOrgAction();
          mockDeleteFromOrgAction.disabled = true;

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({
                deleteFromOrgAction: mockDeleteFromOrgAction,
                readOnly: true,
              })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Remove from organization menu item should be disabled when readOnly is true
          const removeMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.remove_button_text/i,
          });
          expect(removeMenuItem).toHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    describe('deleteFromOrgAction.onBefore', () => {
      describe('when user removes provider from organization', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with removal modal', async () => {
            const user = userEvent.setup();
            const mockDeleteFromOrgAction = createMockDeleteFromOrgAction();
            mockDeleteFromOrgAction.onBefore = vi.fn(() => true);

            renderWithProviders(
              <SsoProviderTable
                {...createMockSsoProviderTableProps({
                  deleteFromOrgAction: mockDeleteFromOrgAction,
                })}
              />,
            );

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            // Open the dropdown menu for the row
            const actionButtons = screen.getAllByRole('button');
            const rowActionButton = actionButtons.find(
              (btn) =>
                btn.querySelector('svg.lucide-more-horizontal') ||
                btn.className.includes('rounded-xl'),
            );
            expect(rowActionButton).toBeDefined();
            await user.click(rowActionButton!);

            // Click the remove from organization menu item
            const removeMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.remove_button_text/i,
            });
            await user.click(removeMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteFromOrgAction.onBefore).toHaveBeenCalledWith(mockProvider);

            // Remove modal should be shown
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with removal modal', async () => {
            const user = userEvent.setup();
            const mockDeleteFromOrgAction = createMockDeleteFromOrgAction();
            mockDeleteFromOrgAction.onBefore = vi.fn(() => false);

            renderWithProviders(
              <SsoProviderTable
                {...createMockSsoProviderTableProps({
                  deleteFromOrgAction: mockDeleteFromOrgAction,
                })}
              />,
            );

            await waitForComponentToLoad();
            await screen.findByText(mockProvider.name!);

            // Open the dropdown menu for the row
            const actionButtons = screen.getAllByRole('button');
            const rowActionButton = actionButtons.find(
              (btn) =>
                btn.querySelector('svg.lucide-more-horizontal') ||
                btn.className.includes('rounded-xl'),
            );
            expect(rowActionButton).toBeDefined();
            await user.click(rowActionButton!);

            // Click the remove from organization menu item
            const removeMenuItem = screen.getByRole('menuitem', {
              name: /table.actions.remove_button_text/i,
            });
            await user.click(removeMenuItem);

            // onBefore should be called with the provider data
            expect(mockDeleteFromOrgAction.onBefore).toHaveBeenCalledWith(mockProvider);

            // Remove modal should NOT be shown
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
          });
        });
      });
    });

    describe('deleteFromOrgAction.onAfter', () => {
      describe('when removal is successful', () => {
        it('should call onAfter after confirming removal in modal', async () => {
          const user = userEvent.setup();
          const mockDeleteFromOrgAction = createMockDeleteFromOrgAction();

          renderWithProviders(
            <SsoProviderTable
              {...createMockSsoProviderTableProps({
                deleteFromOrgAction: mockDeleteFromOrgAction,
              })}
            />,
          );

          await waitForComponentToLoad();
          await screen.findByText(mockProvider.name!);

          // Open the dropdown menu for the row
          const actionButtons = screen.getAllByRole('button');
          const rowActionButton = actionButtons.find(
            (btn) =>
              btn.querySelector('svg.lucide-more-horizontal') ||
              btn.className.includes('rounded-xl'),
          );
          expect(rowActionButton).toBeDefined();
          await user.click(rowActionButton!);

          // Click the remove from organization menu item
          const removeMenuItem = screen.getByRole('menuitem', {
            name: /table.actions.remove_button_text/i,
          });
          await user.click(removeMenuItem);

          // Remove modal should be shown
          await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
          });

          // Type provider name to confirm
          const input = screen.getByRole('textbox');
          await user.type(input, mockProvider.name!);

          // Find and click the confirm removal button in the modal
          const confirmButton = screen.getByRole('button', {
            name: /remove_modal.confirm_button_text|confirm|remove/i,
          });
          await user.click(confirmButton);

          // onAfter should be called after successful removal
          await waitFor(() => {
            expect(
              mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.detach,
            ).toHaveBeenCalled();
            expect(mockDeleteFromOrgAction.onAfter).toHaveBeenCalledWith(mockProvider);
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

        renderWithProviders(
          <SsoProviderTable {...createMockSsoProviderTableProps({ enableProviderAction })} />,
        );

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        // Find the toggle switch in the row
        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toBeInTheDocument();

        // Click the toggle switch
        await user.click(toggleSwitch);

        // onBefore should be called with the provider data
        await waitFor(() => {
          expect(enableProviderAction.onBefore).toHaveBeenCalledWith(mockProvider);
        });

        // API update should be called
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

        renderWithProviders(
          <SsoProviderTable {...createMockSsoProviderTableProps({ enableProviderAction })} />,
        );

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        // Find the toggle switch in the row
        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toBeInTheDocument();

        // Click the toggle switch
        await user.click(toggleSwitch);

        // onBefore should be called
        await waitFor(() => {
          expect(enableProviderAction.onBefore).toHaveBeenCalledWith(mockProvider);
        });

        // API update should NOT be called since onBefore returned false
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
        ).not.toHaveBeenCalled();

        // onAfter should NOT be called
        expect(enableProviderAction.onAfter).not.toHaveBeenCalled();
      });

      it('should disable toggle switch when readOnly is true', async () => {
        const enableProviderAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderWithProviders(
          <SsoProviderTable
            {...createMockSsoProviderTableProps({ enableProviderAction, readOnly: true })}
          />,
        );

        await waitForComponentToLoad();
        await screen.findByText(mockProvider.name!);

        // Find the toggle switch in the row
        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toBeInTheDocument();
        expect(toggleSwitch).toBeDisabled();
      });
    });
  });

  describe('table display', () => {
    describe('when providers are loaded', () => {
      it('should display provider information in table', async () => {
        renderWithProviders(<SsoProviderTable {...createMockSsoProviderTableProps()} />);

        await waitForComponentToLoad();

        // Provider name should be displayed
        await waitFor(() => {
          expect(screen.getByText(mockProvider.name!)).toBeInTheDocument();
        });
      });
    });

    describe('when no providers exist', () => {
      it('should display empty state', async () => {
        renderWithProviders(<SsoProviderTable {...createMockSsoProviderTableProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/table.empty_message/i)).toBeInTheDocument();
      });
    });
  });
});
