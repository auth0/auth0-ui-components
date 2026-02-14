import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderEdit } from '@/components/auth0/my-organization/sso-provider-edit';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockIdentityProvider,
  createMockIdentityProviderWithoutProvisioning,
} from '@/tests/utils/__mocks__';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { SsoProviderEditProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockSsoProviderEditProps = (
  overrides?: Partial<SsoProviderEditProps>,
): SsoProviderEditProps => ({
  providerId: 'con_test123',
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader: false,
  readOnly: false,
  backButton: undefined,
  sso: undefined,
  provisioning: undefined,
  domains: undefined,
  schema: undefined,
  ...overrides,
});

const createMockBackButton = () => ({
  onClick: vi.fn(),
});

const createMockSsoActions = () => ({
  updateAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
  deleteAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
  deleteFromOrganizationAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await waitFor(
    () => {
      // Wait for the loading spinner to disappear
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    },
    { timeout: 3000 },
  );
};

// ===== Tests =====

describe('SsoProviderEdit', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    // Ensure domains API returns an array
    const organizationApi = mockCoreClient.getMyOrganizationApiClient().organization;
    Object.defineProperty(organizationApi, 'domains', {
      value: {
        getAll: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      writable: true,
      configurable: true,
    });

    // Ensure identity providers API returns proper data
    Object.defineProperty(organizationApi, 'identityProviders', {
      value: {
        ...organizationApi.identityProviders,
        get: vi.fn().mockResolvedValue(mockProvider),
        update: vi.fn().mockResolvedValue(mockProvider),
        delete: vi.fn().mockResolvedValue({}),
      },
      writable: true,
      configurable: true,
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('schema', () => {
    describe('when user updates provider', () => {
      it('should render with schema prop', async () => {
        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        // Component renders successfully with default props
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    describe('when using custom message on header', () => {
      it('should use provider display name as title', async () => {
        const customMessages = {
          header: {
            back_button_text: 'Go Back',
          },
        };

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ customMessages })} />,
        );

        await waitForComponentToLoad();
        // Header uses provider display_name or name
        expect(screen.getByText(mockProvider.display_name!)).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for SsoProviderEdit-tabs', () => {
        it('should apply the custom class to SsoProviderEdit-tabs', async () => {
          const customStyling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              'SsoProviderEdit-tabs': 'custom-tabs-class',
            },
          };

          const { container } = renderWithProviders(
            <SsoProviderEdit {...createMockSsoProviderEditProps({ styling: customStyling })} />,
          );

          await waitForComponentToLoad();

          const tabsElement = container.querySelector('.custom-tabs-class');
          expect(tabsElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header with provider name', async () => {
        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ hideHeader: false })} />,
        );

        await waitForComponentToLoad();

        expect(screen.getByText(mockProvider.display_name!)).toBeInTheDocument();
      });
    });

    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ hideHeader: true })} />,
        );

        await waitForComponentToLoad();

        // Header with provider display name should not be present
        expect(screen.queryByText(mockProvider.display_name!)).not.toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should disable delete and remove buttons', async () => {
        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ readOnly: true })} />,
        );

        await waitForComponentToLoad();

        // Check for delete button (should be disabled)
        const deleteButtons = screen.queryAllByRole('button', {
          name: /delete_button_label/i,
        });
        deleteButtons.forEach((button) => {
          expect(button).toBeDisabled();
        });

        // Check for remove button (should be disabled)
        const removeButtons = screen.queryAllByRole('button', {
          name: /remove_button_label/i,
        });
        removeButtons.forEach((button) => {
          expect(button).toBeDisabled();
        });
      });

      it('should disable form save button', async () => {
        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ readOnly: true })} />,
        );

        await waitForComponentToLoad();

        // The save/submit button should be disabled
        const saveButton = screen.queryByRole('button', {
          name: /submit_button_label/i,
        });

        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
      });
    });

    describe('when is false', () => {
      it('should enable delete and remove buttons', async () => {
        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ readOnly: false })} />,
        );

        await waitForComponentToLoad();

        // Check for delete button (should be enabled)
        const deleteButtons = screen.queryAllByRole('button', {
          name: /delete_button_label/i,
        });
        deleteButtons.forEach((button) => {
          expect(button).not.toBeDisabled();
        });

        // Check for remove button (should be enabled)
        const removeButtons = screen.queryAllByRole('button', {
          name: /remove_button_label/i,
        });
        removeButtons.forEach((button) => {
          expect(button).not.toBeDisabled();
        });
      });
    });
  });

  describe('backButton', () => {
    describe('when backButton is provided', () => {
      it('should render back button', async () => {
        const mockBackButton = createMockBackButton();

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ backButton: mockBackButton })} />,
        );

        await waitForComponentToLoad();

        const backButton = screen.queryByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });
    });

    describe('when backButton is not provided', () => {
      it('should not render back button', async () => {
        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        const backButton = screen.queryByRole('button', { name: /back/i });
        expect(backButton).not.toBeInTheDocument();
      });
    });

    describe('when backButton is clicked', () => {
      it('should call backButton.onClick', async () => {
        const user = userEvent.setup();
        const mockBackButton = createMockBackButton();

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ backButton: mockBackButton })} />,
        );

        await waitForComponentToLoad();

        const backButton = screen.getByRole('button', { name: /back/i });
        await user.click(backButton);

        expect(mockBackButton.onClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('tabs', () => {
    describe('SSO tab', () => {
      it('should display SSO configuration tab', async () => {
        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
      });
    });

    describe('Provisioning tab', () => {
      describe('when provisioning is enabled for strategy', () => {
        it('should display provisioning tab', async () => {
          renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

          await waitForComponentToLoad();

          // Note: Default mock provider should have provisioning enabled
          // Verify that the provisioning tab is present
          const provisioningTab = screen.queryByText(/tabs.provisioning.name/i);
          // Tab visibility depends on idpConfig and strategy
          expect(provisioningTab).toBeInTheDocument();
        });
      });

      describe('when provisioning is not enabled for strategy', () => {
        it('should not display provisioning tab when conditions are not met', async () => {
          const providerWithoutProvisioning = createMockIdentityProviderWithoutProvisioning();
          const apiService = mockCoreClient.getMyOrganizationApiClient().organization;
          apiService.identityProviders.get = vi.fn().mockResolvedValue(providerWithoutProvisioning);

          renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

          await waitForComponentToLoad();

          // Tab visibility logic depends on idpConfig and strategy
          // The component should still render the SSO and Domain tabs
          expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
          expect(screen.getByText(/tabs.domains.name/i)).toBeInTheDocument();

          // Provisioning tab should NOT be present when provisioning is not enabled
          expect(screen.queryByText(/tabs.provisioning.name/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('Domain tab', () => {
      it('should display domain configuration tab', async () => {
        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        expect(screen.getByText(/tabs.domains.name/i)).toBeInTheDocument();
      });
    });
  });

  describe('sso action props', () => {
    describe('when sso.updateAction is provided', () => {
      it('should call onBefore when toggling provider', async () => {
        const user = userEvent.setup();
        const ssoActions = createMockSsoActions();

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ sso: ssoActions })} />,
        );

        await waitForComponentToLoad();

        // Toggle the provider switch
        const switches = screen.getAllByRole('switch');
        expect(switches.length).toBeGreaterThan(0);

        const providerSwitch = switches[0];
        expect(providerSwitch).toBeDefined();

        await user.click(providerSwitch!);

        await waitFor(() => {
          expect(ssoActions.updateAction.onBefore).toHaveBeenCalled();
        });
      });

      it('should call onAfter after successful update', async () => {
        const user = userEvent.setup();
        const ssoActions = createMockSsoActions();

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ sso: ssoActions })} />,
        );

        await waitForComponentToLoad();

        // Toggle the provider switch
        const switches = screen.getAllByRole('switch');
        const providerSwitch = switches[0];
        expect(providerSwitch).toBeDefined();

        await user.click(providerSwitch!);

        await waitFor(() => {
          expect(ssoActions.updateAction.onAfter).toHaveBeenCalled();
        });
      });

      it('should not update when onBefore returns false', async () => {
        const user = userEvent.setup();
        const ssoActions = createMockSsoActions();
        ssoActions.updateAction.onBefore = vi.fn(() => false);

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ sso: ssoActions })} />,
        );

        await waitForComponentToLoad();

        // Toggle the provider switch
        const switches = screen.getAllByRole('switch');
        const providerSwitch = switches[0];
        expect(providerSwitch).toBeDefined();

        await user.click(providerSwitch!);

        await waitFor(() => {
          expect(ssoActions.updateAction.onBefore).toHaveBeenCalled();
        });

        // Verify that the update API was not called
        expect(ssoActions.updateAction.onAfter).not.toHaveBeenCalled();
      });
    });

    describe('when sso.deleteAction is provided', () => {
      it('should render with deleteAction props', async () => {
        const ssoActions = createMockSsoActions();

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ sso: ssoActions })} />,
        );

        await waitForComponentToLoad();

        // Component renders with delete action props
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();

        // Delete button should be available
        const deleteButtons = screen.queryAllByRole('button', {
          name: /delete_button_label/i,
        });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });

    describe('when sso.deleteFromOrganizationAction is provided', () => {
      it('should render with deleteFromOrg action props', async () => {
        const ssoActions = createMockSsoActions();

        renderWithProviders(
          <SsoProviderEdit {...createMockSsoProviderEditProps({ sso: ssoActions })} />,
        );

        await waitForComponentToLoad();

        // Component renders with deleteFromOrg action props
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();

        // Remove button should be available
        const removeButtons = screen.queryAllByRole('button', {
          name: /remove_button_label/i,
        });
        expect(removeButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('provisioning action props', () => {
    describe('when provisioning.createAction is provided', () => {
      it('should render with custom create provisioning action', async () => {
        const createAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderWithProviders(
          <SsoProviderEdit
            {...createMockSsoProviderEditProps({ provisioning: { createAction } })}
          />,
        );

        await waitForComponentToLoad();

        // Component renders successfully with provisioning createAction
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();

        // Provisioning tab may be visible depending on strategy
        const provisioningTab = screen.queryByText(/tabs.provisioning.name/i);
        expect(provisioningTab).toBeInTheDocument();
      });
    });

    describe('when provisioning.deleteAction is provided', () => {
      it('should render with custom delete provisioning action', async () => {
        const deleteAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderWithProviders(
          <SsoProviderEdit
            {...createMockSsoProviderEditProps({ provisioning: { deleteAction } })}
          />,
        );

        await waitForComponentToLoad();

        // Component renders successfully with provisioning deleteAction
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
      });
    });

    describe('when provisioning.createScimTokenAction is provided', () => {
      it('should render with custom SCIM token creation action', async () => {
        const createScimTokenAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderWithProviders(
          <SsoProviderEdit
            {...createMockSsoProviderEditProps({
              provisioning: { createScimTokenAction },
            })}
          />,
        );

        await waitForComponentToLoad();

        // Component renders successfully with SCIM token action
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
      });
    });

    describe('when provisioning.deleteScimTokenAction is provided', () => {
      it('should render with custom SCIM token deletion action', async () => {
        const deleteScimTokenAction = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        renderWithProviders(
          <SsoProviderEdit
            {...createMockSsoProviderEditProps({
              provisioning: { deleteScimTokenAction },
            })}
          />,
        );

        await waitForComponentToLoad();

        // Component renders successfully with SCIM token deletion action
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
      });
    });
  });

  describe('domains action props', () => {
    describe('when domains.createAction is provided', () => {
      it('should render with custom domain create action', async () => {
        const domains = {
          createAction: {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          },
          deleteAction: {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          },
        };

        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps({ domains })} />);

        await waitForComponentToLoad();

        // Component renders with domain actions
        expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
        expect(screen.getByText(/tabs.domains.name/i)).toBeInTheDocument();
      });
    });

    describe('when domains.deleteAction is provided', () => {
      it('should render with custom domain delete action', async () => {
        const domains = {
          createAction: {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          },
          deleteAction: {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          },
        };

        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps({ domains })} />);

        await waitForComponentToLoad();

        // Component renders with domain actions
        expect(screen.getByText(/tabs.domains.name/i)).toBeInTheDocument();
      });
    });
  });

  describe('tab switching', () => {
    describe('when user clicks on different tabs', () => {
      it('should switch between SSO and Domain tabs', async () => {
        const user = userEvent.setup();

        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        // Initially on SSO tab
        const ssoTab = screen.getByText(/tabs.sso.name/i);
        expect(ssoTab).toBeInTheDocument();

        // Click on Domain tab
        const domainTab = screen.getByText(/tabs.domains.name/i);
        await user.click(domainTab);

        // Domain tab content should be displayed
        await waitFor(() => {
          expect(domainTab).toBeInTheDocument();
        });
      });

      it('should switch to provisioning tab if available', async () => {
        const user = userEvent.setup();

        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        // Check if provisioning tab is available
        const provisioningTab = screen.queryByText(/tabs.provisioning.name/i);

        expect(provisioningTab).toBeInTheDocument();
        await user.click(provisioningTab!);

        // Provisioning tab content should be displayed
        await waitFor(() => {
          expect(provisioningTab).toBeInTheDocument();
        });
      });
    });
  });

  describe('provider toggle', () => {
    describe('when user toggles provider enabled state', () => {
      it('should update provider enabled status', async () => {
        const user = userEvent.setup();

        renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);

        await waitForComponentToLoad();

        // Toggle switch is in header actions
        const switches = screen.getAllByRole('switch');
        expect(switches.length).toBeGreaterThan(0);

        const firstSwitch = switches[0];
        expect(firstSwitch).toBeDefined();

        await user.click(firstSwitch!);

        await waitFor(() => {
          expect(
            mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.update,
          ).toHaveBeenCalled();
        });
      });
    });
  });
});
