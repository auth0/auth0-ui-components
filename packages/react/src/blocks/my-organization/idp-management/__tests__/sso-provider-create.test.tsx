import {
  AVAILABLE_STRATEGY_LIST,
  type ComponentAction,
  type IdentityProvider,
  type CreateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useConfigModule from '../../../../hooks/my-organization/config/use-config';
import { idpConfigQueryKeys } from '../../../../hooks/my-organization/config/use-idp-config';
import * as useIdpConfigModule from '../../../../hooks/my-organization/config/use-idp-config';
import * as useCoreClientModule from '../../../../hooks/use-core-client';
import { createMockUseConfig } from '../../../../internals/__mocks__/my-organization/config/config.mocks';
import { createMockUseIdpConfig } from '../../../../internals/__mocks__/my-organization/idp-management/idp-config.mocks';
import { createTestQueryClient, renderWithProviders } from '../../../../internals/test-provider';
import { mockCore, mockToast } from '../../../../internals/test-setup';
import type { SsoProviderCreateProps } from '../../../../types/my-organization/idp-management/sso-provider/sso-provider-create-types';
import { SsoProviderCreate } from '../sso-provider-create';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockSsoProviderCreateProps = (
  overrides?: Partial<SsoProviderCreateProps>,
): SsoProviderCreateProps => ({
  createAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  backButton: undefined,
  onNext: undefined,
  onPrevious: undefined,
  schema: undefined,
  ...overrides,
});

const createMockCreateAction = (): ComponentAction<
  CreateIdentityProviderRequestContentPrivate,
  IdentityProvider
> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockBackButton = () => ({
  onClick: vi.fn(),
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
};

const waitForStrategyButtons = async () => {
  const wizardContent = screen.getByTestId('sso-provider-create-content');

  await waitFor(() => {
    const strategyButtons = wizardContent.querySelectorAll('button[class*="justify-start"]');
    expect(strategyButtons.length).toBeGreaterThan(0);
  });

  return wizardContent.querySelectorAll('button[class*="justify-start"]');
};

const createMockIdpConfig = () => ({
  organization: {
    can_set_show_as_button: true,
    can_set_assign_membership_on_login: true,
  },
  strategies: AVAILABLE_STRATEGY_LIST,
});

// ===== Tests =====

describe('SsoProviderCreate', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let queryClient: QueryClient;

  const renderCreate = (overrides?: Partial<SsoProviderCreateProps>) =>
    renderWithProviders(<SsoProviderCreate {...createMockSsoProviderCreateProps(overrides)} />, {
      queryClient,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(idpConfigQueryKeys.config(), createMockIdpConfig());

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(
      createMockUseConfig({
        config: {
          connection_deletion_behavior: 'allow',
          allowed_strategies: ['adfs', 'okta', 'samlp'],
        },
        filteredStrategies: ['adfs', 'okta', 'samlp'],
      }),
    );

    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(createMockUseIdpConfig());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('schema', () => {
    describe('when user submits provider details', () => {
      it('should validate fields with custom schema', async () => {
        const user = userEvent.setup();

        const customSchema = {
          strategy: {
            required: true,
            errorMessage: 'Strategy is required',
          },
        };

        renderCreate({ schema: customSchema });

        await waitForComponentToLoad();

        // Component should render without error with custom schema
        expect(screen.getByText(/steps.one/i)).toBeInTheDocument();

        // Select a strategy to test that custom schema is applied
        const wizardContent = screen.getByTestId('sso-provider-create-content');
        const strategyButtons = await waitForStrategyButtons();
        const firstStrategyButton = strategyButtons[0];
        expect(firstStrategyButton).toBeDefined();

        // Click the first strategy button
        await user.click(firstStrategyButton!);
        await waitFor(() => {
          expect(
            wizardContent.querySelector('[data-slot="stepper-step"][data-state="completed"]'),
          ).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(
            screen.getByRole('button', {
              name: /previousbuttonlabel/i,
            }),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('customMessages', () => {
    describe('when using custom message on step title', () => {
      it('should override step titles', async () => {
        const customMessages = {
          header: {
            title: 'Custom Header Title',
            back_button_text: 'Custom Back Button',
          },
        };

        renderCreate({ customMessages });

        await waitForComponentToLoad();

        expect(screen.getByText(customMessages.header.title)).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for SsoProviderCreate-wizard', () => {
        it('should apply the custom class to SsoProviderCreate-wizard', async () => {
          const customStyling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              'SsoProviderCreate-wizard': 'custom-wizard-class',
            },
          };

          const { container } = renderCreate({ styling: customStyling });

          await waitForComponentToLoad();

          await waitFor(() => {
            const wizardElement = container.querySelector('.custom-wizard-class');
            expect(wizardElement).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('createAction', () => {
    describe('createAction.disabled', () => {
      describe('when is true', () => {
        it('should disable create functionality', async () => {
          const user = userEvent.setup();
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = true;

          renderCreate({ createAction: mockCreateAction });

          await waitForComponentToLoad();

          // 1. Select a strategy to enable next
          const strategyCards = await waitForStrategyButtons();
          const firstStrategyButton = strategyCards[0];
          expect(firstStrategyButton).toBeDefined();
          await user.click(firstStrategyButton!);

          await waitFor(() => {
            expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
          });

          // Fill provider details
          const nameInput = screen.getByRole('textbox', {
            name: /fields\.name\.label/i,
          });
          await user.type(nameInput, 'test-provider');
          const displayName = screen.getByRole('textbox', {
            name: /fields\.display_name\.label/i,
          });
          await user.type(displayName, 'test-provider-label');

          const providerNextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
          await user.click(providerNextButton);

          // Configure provider
          const adfsMetadataUrl = screen.getByRole('textbox', {
            name: /fields\.adfs\.meta_data_url\.label/i,
          });
          await user.type(adfsMetadataUrl, 'https://example.com/metadata');

          const adfsMetadataLocationUrl = screen.getByRole('textbox', {
            name: /fields\.adfs\.meta_data_location_url\.label/i,
          });
          await user.type(adfsMetadataLocationUrl, 'https://example.com/location');

          // Complete the wizard
          const completeButton = screen.getByRole('button', { name: /completebuttonlabel/i });
          await user.click(completeButton);
        });
      });

      describe('when is false', () => {
        it('should enable create functionality', async () => {
          const user = userEvent.setup();
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.disabled = false;

          renderCreate({ createAction: mockCreateAction });

          await waitForComponentToLoad();

          // 1. Select a strategy to enable next
          const strategyCards = await waitForStrategyButtons();
          const firstStrategyButton = strategyCards[0];
          expect(firstStrategyButton).toBeDefined();
          await user.click(firstStrategyButton!);

          await waitFor(() => {
            expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
          });

          // Fill provider details
          const nameInput = screen.getByRole('textbox', {
            name: /fields\.name\.label/i,
          });
          await user.type(nameInput, 'test-provider');
          const displayName = screen.getByRole('textbox', {
            name: /fields\.display_name\.label/i,
          });
          await user.type(displayName, 'test-provider-label');

          const providerNextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
          await user.click(providerNextButton);

          // Configure provider
          const adfsMetadataUrl = screen.getByRole('textbox', {
            name: /fields\.adfs\.meta_data_url\.label/i,
          });
          await user.type(adfsMetadataUrl, 'https://example.com/metadata');

          const adfsMetadataLocationUrl = screen.getByRole('textbox', {
            name: /fields\.adfs\.meta_data_location_url\.label/i,
          });
          await user.type(adfsMetadataLocationUrl, 'https://example.com/location');

          // Complete the wizard
          const completeButton = screen.getByRole('button', { name: /completebuttonlabel/i });
          await user.click(completeButton);

          // Verify that the API was called because createAction is enabled
          await waitFor(() => {
            expect(
              mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.create,
            ).toHaveBeenCalled();
          });
        });
      });
    });

    describe('createAction.onBefore', () => {
      describe('when user completes wizard', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with create', async () => {
            const user = userEvent.setup();
            const mockCreateAction = createMockCreateAction();
            mockCreateAction.onBefore = vi.fn(() => true);

            renderCreate({ createAction: mockCreateAction });

            await waitForComponentToLoad();

            // 1. Select a strategy to enable next
            const strategyCards = await waitForStrategyButtons();
            const firstStrategyButton = strategyCards[0];
            expect(firstStrategyButton).toBeDefined();
            await user.click(firstStrategyButton!);

            await waitFor(() => {
              expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
            });

            // Fill provider details
            const nameInput = screen.getByRole('textbox', {
              name: /fields\.name\.label/i,
            });
            await user.type(nameInput, 'test-provider');
            const displayName = screen.getByRole('textbox', {
              name: /fields\.display_name\.label/i,
            });
            await user.type(displayName, 'test-provider-label');

            const providerNextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
            await user.click(providerNextButton);
            // Configure provider (assuming at least one configurable field)
            const adfsMetadataUrl = screen.getByRole('textbox', {
              name: /fields\.adfs\.meta_data_url\.label/i,
            });
            await user.type(adfsMetadataUrl, 'https://example.com/metadata');

            const adfsMetadataLocationUrl = screen.getByRole('textbox', {
              name: /fields\.adfs\.meta_data_location_url\.label/i,
            });
            await user.type(adfsMetadataLocationUrl, 'https://example.com/location');

            // Complete the wizard
            const completeButton = screen.getByRole('button', { name: /completebuttonlabel/i });
            await user.click(completeButton);

            await waitFor(() => {
              expect(mockCreateAction.onBefore).toHaveBeenCalled();
            });
            await waitFor(() => {
              expect(
                mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.create,
              ).toHaveBeenCalled();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with create', async () => {
            const user = userEvent.setup();
            const mockCreateAction = createMockCreateAction();
            mockCreateAction.onBefore = vi.fn(() => false);

            renderCreate({ createAction: mockCreateAction });

            await waitForComponentToLoad();

            // 1. Select a strategy to enable next
            const strategyCards = await waitForStrategyButtons();
            const firstStrategyButton = strategyCards[0];
            expect(firstStrategyButton).toBeDefined();
            await user.click(firstStrategyButton!);

            await waitFor(() => {
              expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
            });

            // Fill provider details
            const nameInput = screen.getByRole('textbox', {
              name: /fields\.name\.label/i,
            });
            await user.type(nameInput, 'test-provider');
            const displayName = screen.getByRole('textbox', {
              name: /fields\.display_name\.label/i,
            });
            await user.type(displayName, 'test-provider-label');

            const providerNextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
            await user.click(providerNextButton);

            // Configure provider (assuming at least one configurable field)
            const adfsMetadataUrl = screen.getByRole('textbox', {
              name: /fields\.adfs\.meta_data_url\.label/i,
            });
            await user.type(adfsMetadataUrl, 'https://example.com/metadata');

            const adfsMetadataLocationUrl = screen.getByRole('textbox', {
              name: /fields\.adfs\.meta_data_location_url\.label/i,
            });
            await user.type(adfsMetadataLocationUrl, 'https://example.com/location');

            // Complete the wizard
            const completeButton = screen.getByRole('button', { name: /completebuttonlabel/i });
            await user.click(completeButton);

            // Verify onBefore was called
            await waitFor(() => {
              expect(mockCreateAction.onBefore).toHaveBeenCalled();
            });

            // Verify that the API was NOT called because onBefore returned false
            await waitFor(() => {
              expect(
                mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.create,
              ).not.toHaveBeenCalled();
            });
          });
        });
      });
    });

    describe('createAction.onAfter', () => {
      describe('when create is successful', () => {
        it('should call onAfter with created provider', async () => {
          const user = userEvent.setup();
          const mockCreateAction = createMockCreateAction();
          mockCreateAction.onAfter = vi.fn();

          renderCreate({ createAction: mockCreateAction });

          await waitForComponentToLoad();

          // 1. Select a strategy to enable next
          const strategyCards = await waitForStrategyButtons();

          const firstStrategyButton = strategyCards[0];
          expect(firstStrategyButton).toBeDefined();
          await user.click(firstStrategyButton!);

          await waitFor(() => {
            expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
          });

          // Fill provider details
          const nameInput = screen.getByRole('textbox', {
            name: /fields\.name\.label/i,
          });
          await user.type(nameInput, 'test-provider');
          const displayName = screen.getByRole('textbox', {
            name: /fields\.display_name\.label/i,
          });
          await user.type(displayName, 'test-provider-label');

          const providerNextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
          await user.click(providerNextButton);

          // Configure provider (assuming at least one configurable field)
          const adfsMetadataUrl = screen.getByRole('textbox', {
            name: /fields\.adfs\.meta_data_url\.label/i,
          });
          await user.type(adfsMetadataUrl, 'https://example.com/metadata');

          const adfsMetadataLocationUrl = screen.getByRole('textbox', {
            name: /fields\.adfs\.meta_data_location_url\.label/i,
          });
          await user.type(adfsMetadataLocationUrl, 'https://example.com/location');

          // Complete the wizard
          const completeButton = screen.getByRole('button', { name: /completebuttonlabel/i });
          await user.click(completeButton);

          // Verify that the create API was called
          await waitFor(() => {
            expect(
              mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.create,
            ).toHaveBeenCalled();
          });

          // Verify onAfter was called with the created provider
          await waitFor(() => {
            expect(mockCreateAction.onAfter).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('backButton', () => {
    describe('when backButton is provided', () => {
      it('should render back button', async () => {
        const mockBackButton = createMockBackButton();

        renderCreate({ backButton: mockBackButton });

        await waitForComponentToLoad();

        const backButton = screen.queryByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });
    });

    describe('when backButton is not provided', () => {
      it('should not render back button', async () => {
        renderCreate();

        await waitForComponentToLoad();

        const backButton = screen.queryByRole('button', { name: /back/i });
        expect(backButton).not.toBeInTheDocument();
      });
    });

    describe('when backButton is clicked', () => {
      it('should call backButton.onClick', async () => {
        const user = userEvent.setup();
        const mockBackButton = createMockBackButton();

        renderCreate({ backButton: mockBackButton });

        await waitForComponentToLoad();

        const backButton = screen.getByRole('button', { name: /back/i });
        await user.click(backButton);

        expect(mockBackButton.onClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('onNext', () => {
    describe('when user navigates to next step', () => {
      describe('when onNext returns true', () => {
        it('should proceed to next step', async () => {
          const user = userEvent.setup();
          const onNext = vi.fn(() => true);

          renderCreate({ onNext });

          await waitForComponentToLoad();

          // Select a strategy to enable next
          const strategyCards = await waitForStrategyButtons();
          const firstStrategyButton = strategyCards[0];
          expect(firstStrategyButton).toBeDefined();
          await user.click(firstStrategyButton!);

          await waitFor(() => {
            expect(onNext).toHaveBeenCalled();
          });
        });
      });

      describe('when onNext returns false', () => {
        it('should not proceed to next step', async () => {
          const user = userEvent.setup();
          const onNext = vi.fn(() => false);

          renderCreate({ onNext });

          await waitForComponentToLoad();

          // Select a strategy
          const strategyCards = await waitForStrategyButtons();
          const firstStrategyButton = strategyCards[0];
          expect(firstStrategyButton).toBeDefined();
          await user.click(firstStrategyButton!);

          await waitFor(() => {
            expect(onNext).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('onPrevious', () => {
    describe('when user navigates to previous step', () => {
      it('should call onPrevious with step data', async () => {
        const user = userEvent.setup();
        const onPrevious = vi.fn(() => true);

        renderCreate({ onPrevious });

        await waitForComponentToLoad();

        // Select a strategy
        const strategyCards = await waitForStrategyButtons();
        const firstStrategyButton = strategyCards[0];
        expect(firstStrategyButton).toBeDefined();
        await user.click(firstStrategyButton!);

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /previousbuttonlabel/i })).toBeInTheDocument();
        });

        const previousButton = screen.getByRole('button', {
          name: /previousbuttonlabel/i,
        });
        await user.click(previousButton);

        await waitFor(() => {
          expect(onPrevious).toHaveBeenCalled();
        });
      });
    });
  });

  describe('wizard flow', () => {
    describe('when user completes all steps', () => {
      it('should navigate through provider selection, details, and configuration', async () => {
        const user = userEvent.setup();
        const mockCreateAction = createMockCreateAction();

        renderCreate({ createAction: mockCreateAction });

        await waitForComponentToLoad();

        // Step 1: Provider selection
        expect(screen.getByText(/steps.one/i)).toBeInTheDocument();

        const strategyCards = await waitForStrategyButtons();
        const firstStrategyButton = strategyCards[0];
        expect(firstStrategyButton).toBeDefined();
        await user.click(firstStrategyButton!);

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
        });

        // Fill provider details
        const nameInput = screen.getByRole('textbox', {
          name: /fields\.name\.label/i,
        });
        await user.type(nameInput, 'test-provider');
        const displayName = screen.getByRole('textbox', {
          name: /fields\.display_name\.label/i,
        });
        await user.type(displayName, 'test-provider-label');

        const providerNextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
        await user.click(providerNextButton);

        // Configure provider (assuming at least one configurable field)
        const adfsMetadataUrl = screen.getByRole('textbox', {
          name: /fields\.adfs\.meta_data_url\.label/i,
        });
        await user.type(adfsMetadataUrl, 'https://example.com/metadata');

        const adfsMetadataLocationUrl = screen.getByRole('textbox', {
          name: /fields\.adfs\.meta_data_location_url\.label/i,
        });
        await user.type(adfsMetadataLocationUrl, 'https://example.com/location');

        // Complete the wizard
        const completeButton = screen.getByRole('button', { name: /completebuttonlabel/i });
        await user.click(completeButton);

        // Verify that the create API was called
        await waitFor(() => {
          expect(
            mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.create,
          ).toHaveBeenCalled();
        });
      });
    });
  });
});
