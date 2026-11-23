import {
  AVAILABLE_STRATEGY_LIST,
  idpConfigQueryKeys,
  type ComponentAction,
  type IdpKnownResponse,
  type CreateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  SsoProviderCreate,
  SsoProviderCreateView,
} from '@/components/auth0/my-organization/sso-provider-create';
import * as useConfigModule from '@/hooks/my-organization/shared/services/use-config-service';
import * as useIdpConfigModule from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderCreate } from '@/hooks/my-organization/use-sso-provider-create';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { createTestQueryClient, renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { SsoProviderCreateProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

mockToast();
const { initMockCoreClient } = mockCore();

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
  IdpKnownResponse
> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockBackButton = () => ({
  onClick: vi.fn(),
});

const waitForComponentToLoad = async () => {
  await screen.findByTestId('sso-provider-create-content');

  return await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
};

const waitForStrategyButtons = async () => {
  const wizardContent = await screen.findByTestId('sso-provider-create-content');

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

  describe('guidedSetup', () => {
    const CREATED_PROVIDER = {
      id: 'con_123',
      name: 'my-okta',
      strategy: 'okta',
      options: {},
      attributes: [
        {
          user_attribute_profile_id: 'email',
          label: 'Email',
          description: 'Email',
          sso_field: ['email'],
          is_required: true,
        },
      ],
    } as unknown as IdpKnownResponse;

    const guidedSetupButton = () =>
      screen.queryByRole('button', { name: 'guided_setup_button_text' });
    const pageTitle = () => document.querySelector('[data-slot="sso-guided-setup-page-title"]');
    const domainInput = () => screen.getByRole('textbox', { name: /fields\.okta\.domain\.label/i });

    const goToConfigureStep = async (
      user: ReturnType<typeof userEvent.setup>,
      strategyName = 'Okta',
    ) => {
      await waitForComponentToLoad();
      const strategyButtons = await waitForStrategyButtons();
      const strategyButton = Array.from(strategyButtons).find((button) =>
        button.textContent?.includes(strategyName),
      );
      await user.click(strategyButton!);
      await user.type(screen.getByRole('textbox', { name: /fields\.name\.label/i }), 'my-okta');
      await user.type(
        screen.getByRole('textbox', { name: /fields\.display_name\.label/i }),
        'My Okta',
      );
      await user.click(screen.getByRole('button', { name: /nextbuttonlabel/i }));
      await screen.findByRole('button', { name: /completebuttonlabel/i });
    };

    const fillOktaConnection = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(domainInput(), 'acme.okta.com');
      await user.type(
        screen.getByRole('textbox', { name: /fields\.okta\.client_id\.label/i }),
        'client-id',
      );
      await user.type(screen.getByLabelText(/fields\.okta\.client_secret\.label/i), 'secret');
    };

    it('is not offered unless enabled', async () => {
      const user = userEvent.setup();
      renderCreate();

      await goToConfigureStep(user);

      expect(guidedSetupButton()).not.toBeInTheDocument();
    });

    it('is not offered without permission to read the configuration', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <SsoProviderCreate
          {...createMockSsoProviderCreateProps({ guidedSetup: { enabled: true } })}
        />,
        {
          queryClient,
          permissions: ALL_MY_ORG_PERMISSIONS.filter((p) => p !== 'read:my_org:configuration'),
        },
      );

      await goToConfigureStep(user);

      expect(guidedSetupButton()).not.toBeInTheDocument();
    });

    it('opens guided setup on the same page with the values entered so far', async () => {
      const user = userEvent.setup();
      renderCreate({ guidedSetup: { enabled: true } });
      await goToConfigureStep(user);
      await user.type(domainInput(), 'acme.okta.com');

      await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));

      await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      expect(
        screen.queryByRole('button', { name: /completebuttonlabel/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://test-domain.auth0.com/login/callback'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /^next$/ }));
      expect(pageTitle()).toHaveTextContent('Configure Connection');
      expect(domainInput()).toHaveValue('acme.okta.com');
    });

    it('leaves the SAML service provider values out of the guided form', async () => {
      const user = userEvent.setup();
      renderCreate({ guidedSetup: { enabled: true } });
      await goToConfigureStep(user, 'Custom SAML');
      expect(screen.getByText('fields.samlp.acs_url.label')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
      await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      await user.click(screen.getByRole('button', { name: /^next$/ }));

      expect(pageTitle()).toHaveTextContent('Configure Connection');
      for (const field of ['callback_url', 'acs_url', 'sp_metadata_url', 'sp_issuer_urn']) {
        expect(screen.queryByText(`fields.samlp.${field}.label`)).not.toBeInTheDocument();
      }
    });

    it('keeps the configure values when moving between pages', async () => {
      const user = userEvent.setup();
      renderCreate({ guidedSetup: { enabled: true } });
      await goToConfigureStep(user);
      await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
      await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      await user.click(screen.getByRole('button', { name: /^next$/ }));

      await user.type(domainInput(), 'acme.okta.com');
      await user.click(screen.getByRole('button', { name: /create application/i }));
      expect(pageTitle()).toHaveTextContent('Create Application');
      await user.click(screen.getByRole('button', { name: /^next$/ }));

      expect(domainInput()).toHaveValue('acme.okta.com');
    });

    it('creates the provider mid-flow and runs onAfter on Done', async () => {
      const user = userEvent.setup();
      const createAction = createMockCreateAction();
      const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .create as ReturnType<typeof vi.fn>;
      createApi.mockResolvedValueOnce(CREATED_PROVIDER);
      renderCreate({ createAction, guidedSetup: { enabled: true } });
      await goToConfigureStep(user);
      await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
      await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      await user.click(screen.getByRole('button', { name: /^next$/ }));
      await fillOktaConnection(user);

      await user.click(screen.getByRole('button', { name: /^create_provider$/ }));
      await user.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));

      await waitFor(() => expect(pageTitle()).toHaveTextContent('Claims Mapping'));
      expect(createApi).toHaveBeenCalledTimes(1);
      expect(createApi.mock.calls[0]![0]).toMatchObject({
        strategy: 'okta',
        name: 'my-okta',
        display_name: 'My Okta',
      });
      expect(createAction.onAfter).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: /^next$/ }));
      await user.click(screen.getByRole('button', { name: /^next$/ }));
      await user.click(screen.getByRole('button', { name: /^done$/ }));

      expect(createAction.onAfter).toHaveBeenCalledTimes(1);
      expect(createAction.onAfter).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'my-okta', strategy: 'okta' }),
        CREATED_PROVIDER,
      );
    });

    describe('connection access set in the advanced form', () => {
      const createThroughGuidedSetup = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
        await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
        await user.click(screen.getByRole('button', { name: /^next$/ }));
        await fillOktaConnection(user);
        await user.click(screen.getByRole('button', { name: /^create_provider$/ }));
        await user.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));
      };

      it('sends third-party access set before switching to guided setup', async () => {
        vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(
          createMockUseConfig({
            config: { connection_deletion_behavior: 'allow', allowed_strategies: ['okta'] },
            filteredStrategies: ['okta'],
            showThirdPartyAccess: true,
          }),
        );
        const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .create as ReturnType<typeof vi.fn>;
        createApi.mockResolvedValueOnce(CREATED_PROVIDER);
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });
        await goToConfigureStep(user);
        await user.click(screen.getByRole('checkbox', { name: 'label' }));

        await createThroughGuidedSetup(user);

        await waitFor(() => expect(createApi).toHaveBeenCalledTimes(1));
        expect(createApi.mock.calls[0]![0]).toMatchObject({
          use_for_third_party_client_access: true,
        });
      });

      it('leaves out access fields the advanced form never showed', async () => {
        const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .create as ReturnType<typeof vi.fn>;
        createApi.mockResolvedValueOnce(CREATED_PROVIDER);
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });
        await goToConfigureStep(user);

        await createThroughGuidedSetup(user);

        await waitFor(() => expect(createApi).toHaveBeenCalledTimes(1));
        expect(createApi.mock.calls[0]![0].use_for_third_party_client_access).toBeUndefined();
      });
    });

    it('locks the configure form once the provider is created', async () => {
      const user = userEvent.setup();
      const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .create as ReturnType<typeof vi.fn>;
      createApi.mockResolvedValueOnce(CREATED_PROVIDER);
      renderCreate({ guidedSetup: { enabled: true } });
      await goToConfigureStep(user);
      await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
      await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      await user.click(screen.getByRole('button', { name: /^next$/ }));
      await fillOktaConnection(user);
      await user.click(screen.getByRole('button', { name: /^create_provider$/ }));
      await user.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));
      await waitFor(() => expect(pageTitle()).toHaveTextContent('Claims Mapping'));

      await user.click(screen.getByRole('button', { name: /Configure Connection/ }));

      expect(pageTitle()).toHaveTextContent('Configure Connection');
      expect(domainInput()).toHaveValue('acme.okta.com');
      expect(domainInput()).toHaveAttribute('readonly');
    });

    describe('SAML and ADFS connection tabs', () => {
      const openGuidedConfigure = async (
        user: ReturnType<typeof userEvent.setup>,
        strategyName: string,
      ) => {
        await goToConfigureStep(user, strategyName);
        await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
        await waitFor(() => expect(pageTitle()).toBeInTheDocument());
        while (!pageTitle()?.textContent?.includes('Configure Connection')) {
          await user.click(screen.getByRole('button', { name: /^next$/ }));
        }
      };
      const tab = (name: 'automatic' | 'manual') =>
        screen.getByRole('tab', { name: `fields.common.connection_method.${name}` });

      it('keeps the Automatic and Manual SAML values apart', async () => {
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });
        await openGuidedConfigure(user, 'Custom SAML');
        const metadataUrl = () =>
          screen.getByRole('textbox', { name: /fields\.samlp\.meta_data_url\.label/i });
        const signInUrl = () =>
          screen.getByRole('textbox', { name: /fields\.samlp\.single_sign_on_login_url\.label/i });

        await user.type(metadataUrl(), 'https://idp.example.com/metadata');
        await user.click(tab('manual'));
        await user.type(signInUrl(), 'https://idp.example.com/sso');
        await user.click(tab('automatic'));
        expect(metadataUrl()).toHaveValue('https://idp.example.com/metadata');
        await user.click(tab('manual'));
        expect(signInUrl()).toHaveValue('https://idp.example.com/sso');
      });

      it('creates a SAML provider from the Automatic tab only', async () => {
        const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .create as ReturnType<typeof vi.fn>;
        createApi.mockResolvedValueOnce({ ...CREATED_PROVIDER, strategy: 'samlp' });
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });
        await openGuidedConfigure(user, 'Custom SAML');
        await user.type(
          screen.getByRole('textbox', { name: /fields\.samlp\.meta_data_url\.label/i }),
          'https://idp.example.com/metadata',
        );
        await user.click(tab('manual'));
        await user.type(
          screen.getByRole('textbox', { name: /fields\.samlp\.single_sign_on_login_url\.label/i }),
          'https://idp.example.com/sso',
        );
        await user.click(tab('automatic'));

        await user.click(screen.getByRole('button', { name: /^create_provider$/ }));
        await user.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));

        await waitFor(() => expect(createApi).toHaveBeenCalledTimes(1));
        const body = JSON.stringify(createApi.mock.calls[0]![0]);
        expect(body).toContain('https://idp.example.com/metadata');
        expect(body).not.toContain('https://idp.example.com/sso');
      });

      it('shows the ADFS Automatic and Manual tabs and keeps the Automatic values', async () => {
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });
        await openGuidedConfigure(user, 'ADFS');
        const server = () =>
          screen.getByRole('textbox', { name: /fields\.adfs\.meta_data_url\.label/i });

        await user.type(server(), 'https://adfs.example.com');
        await user.click(tab('manual'));
        await user.click(tab('automatic'));

        expect(server()).toHaveValue('https://adfs.example.com');
      });
    });

    describe('strategies with connection access fields in the wizard', () => {
      it('sends third-party and Cross App Access set for ADFS before switching to guided setup', async () => {
        vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(
          createMockUseConfig({
            config: { connection_deletion_behavior: 'allow', allowed_strategies: ['adfs'] },
            filteredStrategies: ['adfs'],
            showThirdPartyAccess: true,
          }),
        );
        vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(
          createMockUseIdpConfig({
            showCrossAppAccess: vi.fn(() => true),
            isCrossAppAccessReadOnly: vi.fn(() => false),
          }),
        );
        const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .create as ReturnType<typeof vi.fn>;
        createApi.mockResolvedValueOnce({ ...CREATED_PROVIDER, strategy: 'adfs' });
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });
        await goToConfigureStep(user, 'ADFS');
        const [thirdParty, crossAppAccess] = screen.getAllByRole('checkbox', { name: 'label' });
        await user.click(thirdParty!);
        await user.click(crossAppAccess!);

        await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
        await waitFor(() => expect(pageTitle()).toBeInTheDocument());
        while (!pageTitle()?.textContent?.includes('Configure Connection')) {
          await user.click(screen.getByRole('button', { name: /^next$/ }));
        }
        expect(screen.queryByRole('checkbox', { name: 'label' })).not.toBeInTheDocument();
        await user.type(
          screen.getByRole('textbox', { name: /fields\.adfs\.meta_data_url\.label/i }),
          'https://adfs.example.com',
        );
        await user.click(screen.getByRole('button', { name: /^create_provider$/ }));
        await user.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));

        await waitFor(() => expect(createApi).toHaveBeenCalledTimes(1));
        expect(createApi.mock.calls[0]![0]).toMatchObject({
          strategy: 'adfs',
          use_for_third_party_client_access: true,
          cross_app_access_resource_app: { status: 'enabled' },
        });
      });
    });

    it('stays on the configure page when creating fails', async () => {
      const user = userEvent.setup();
      const createAction = createMockCreateAction();
      const createApi = mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
        .create as ReturnType<typeof vi.fn>;
      createApi.mockRejectedValueOnce(new Error('boom'));
      renderCreate({ createAction, guidedSetup: { enabled: true } });
      await goToConfigureStep(user);
      await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
      await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      await user.click(screen.getByRole('button', { name: /^next$/ }));
      await fillOktaConnection(user);

      await user.click(screen.getByRole('button', { name: /^create_provider$/ }));
      await user.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));

      await waitFor(() => expect(createApi).toHaveBeenCalledTimes(1));
      expect(pageTitle()).toHaveTextContent('Configure Connection');
      expect(createAction.onAfter).not.toHaveBeenCalled();
    });

    describe('attribute mappings', () => {
      const ADFS_USER_ATTRIBUTES = {
        email: {
          label: 'Email',
          description: 'Email',
          is_required: true,
          sso_field: ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        },
        given_name: {
          label: 'Given Name',
          description: 'First name',
          is_required: false,
          sso_field: ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
        },
      };

      const mockIdpConfig = (idpConfig: unknown) => {
        vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(
          createMockUseIdpConfig({
            idpConfig: idpConfig as ReturnType<typeof createMockUseIdpConfig>['idpConfig'],
          }),
        );
      };

      const withAdfsUserAttributes = (userAttributes: Record<string, unknown>) => {
        const base = createMockUseIdpConfig().idpConfig!;
        return {
          ...base,
          strategies: {
            ...base.strategies,
            adfs: {
              enabled_features: [],
              provisioning_methods: [],
              user_attributes: userAttributes,
            },
          },
        };
      };

      const openAdfsGuidedSetup = async (user: ReturnType<typeof userEvent.setup>) => {
        renderCreate({ guidedSetup: { enabled: true } });
        await goToConfigureStep(user, 'ADFS');
        await user.click(await screen.findByRole('button', { name: 'guided_setup_button_text' }));
        await waitFor(() => expect(pageTitle()).toHaveTextContent('Create Application'));
      };

      it('shows the mappings from the configuration before the provider exists', async () => {
        mockIdpConfig(withAdfsUserAttributes(ADFS_USER_ATTRIBUTES));
        const user = userEvent.setup();
        await openAdfsGuidedSetup(user);

        await user.click(screen.getByRole('button', { name: /^next$/ }));

        expect(pageTitle()).toHaveTextContent('Configure Claims Issuance Policy');
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(
          screen.getByDisplayValue(
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          ),
        ).toBeInTheDocument();
        expect(screen.queryByText('attribute_mapping_pending')).not.toBeInTheDocument();
      });

      it('skips the mapping page when the configuration has no mappings', async () => {
        mockIdpConfig(withAdfsUserAttributes({}));
        const user = userEvent.setup();
        await openAdfsGuidedSetup(user);

        expect(screen.queryByText('Configure Claims Issuance Policy')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /^next$/ }));
        expect(pageTitle()).toHaveTextContent('Configure Connection');
      });

      it('leaves the wizard working when the configuration has a malformed attribute', async () => {
        mockIdpConfig(withAdfsUserAttributes({ email: null, name: { sso_field: 'name' } }));
        const user = userEvent.setup();
        renderCreate({ guidedSetup: { enabled: true } });

        await goToConfigureStep(user, 'ADFS');

        expect(
          await screen.findByRole('button', { name: 'guided_setup_button_text' }),
        ).toBeInTheDocument();
      });

      it('stops on the mapping page when the configuration is unavailable', async () => {
        mockIdpConfig(null);
        const user = userEvent.setup();
        await openAdfsGuidedSetup(user);

        await user.click(screen.getByRole('button', { name: /^next$/ }));

        expect(pageTitle()).toHaveTextContent('Configure Claims Issuance Policy');
        expect(screen.getByRole('alert')).toHaveTextContent('attribute_mapping_unavailable');
        expect(screen.getByRole('button', { name: /^next$/ })).toBeDisabled();
      });

      it('offers a retry and does not block Next when the configuration fails to load', async () => {
        const refetchIdpConfig = vi.fn(async () => undefined);
        vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(
          createMockUseIdpConfig({ idpConfig: null, isIdpConfigError: true, refetchIdpConfig }),
        );
        const user = userEvent.setup();
        await openAdfsGuidedSetup(user);

        await user.click(screen.getByRole('button', { name: /^next$/ }));

        expect(pageTitle()).toHaveTextContent('Configure Claims Issuance Policy');
        expect(screen.getByRole('alert')).toHaveTextContent('attribute_mapping_load_failed');
        expect(screen.getByRole('button', { name: /^next$/ })).toBeEnabled();

        await user.click(screen.getByRole('button', { name: 'attribute_mapping_retry' }));
        expect(refetchIdpConfig).toHaveBeenCalledTimes(1);
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

  describe('showSignRequest', () => {
    const goToSamlpConfigureStep = async () => {
      const user = userEvent.setup();

      await waitForComponentToLoad();
      const strategyButtons = Array.from(await waitForStrategyButtons());
      const samlpButton = strategyButtons.find((button) => /saml/i.test(button.textContent ?? ''));
      await user.click(samlpButton!);

      await user.type(
        screen.getByRole('textbox', { name: /fields\.name\.label/i }),
        'test-saml-provider',
      );
      await user.type(
        screen.getByRole('textbox', { name: /fields\.display_name\.label/i }),
        'Test SAML Provider',
      );
      await user.click(screen.getByRole('button', { name: /nextbuttonlabel/i }));

      await user.click(
        await screen.findByRole('button', { name: /fields\.samlp\.advanced_settings\.title/i }),
      );
    };

    describe('when not set', () => {
      it('should show the SAML sign request option', async () => {
        renderCreate();

        await goToSamlpConfigureStep();

        expect(
          screen.getByText('fields.samlp.advanced_settings.sign_request.label'),
        ).toBeInTheDocument();
      });
    });

    describe('when false', () => {
      it('should hide the SAML sign request option and keep request binding', async () => {
        renderCreate({ showSignRequest: false });

        await goToSamlpConfigureStep();

        expect(
          screen.queryByText('fields.samlp.advanced_settings.sign_request.label'),
        ).not.toBeInTheDocument();
        expect(
          screen.getByText('fields.samlp.advanced_settings.request_protocol_binding.label'),
        ).toBeInTheDocument();
      });
    });

    describe('when false on the composable SsoProviderCreateView', () => {
      it('should hide the SAML sign request option', async () => {
        const createAction = createMockCreateAction();
        function ComposedSsoProviderCreate() {
          const ssoProviderCreate = useSsoProviderCreate({ createAction });
          return (
            <SsoProviderCreateView
              {...ssoProviderCreate}
              {...ssoProviderCreate.formData}
              showSignRequest={false}
            />
          );
        }
        renderWithProviders(<ComposedSsoProviderCreate />, { queryClient });

        await goToSamlpConfigureStep();

        expect(
          screen.queryByText('fields.samlp.advanced_settings.sign_request.label'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('header rendering', () => {
    describe('when component loads', () => {
      it('should render header with title', async () => {
        renderCreate();

        await waitForComponentToLoad();

        expect(screen.getByText(/header.title/i)).toBeInTheDocument();
      });

      it('should display step indicators', async () => {
        renderCreate();

        await waitForComponentToLoad();

        expect(screen.getByText(/steps.one/i)).toBeInTheDocument();
      });
    });
  });

  describe('strategy selection', () => {
    describe('when strategies are available', () => {
      it('should display available strategy options', async () => {
        renderCreate();

        await waitForComponentToLoad();

        const strategyButtons = await waitForStrategyButtons();
        expect(strategyButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('form validation', () => {
    describe('when provider name is empty', () => {
      it('should show validation when trying to proceed without name', async () => {
        const user = userEvent.setup();

        renderCreate();

        await waitForComponentToLoad();

        const strategyCards = await waitForStrategyButtons();
        const firstStrategyButton = strategyCards[0];
        expect(firstStrategyButton).toBeDefined();
        await user.click(firstStrategyButton!);

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /nextbuttonlabel/i })).toBeInTheDocument();
        });

        // Try to click next without filling name
        const nextButton = screen.getByRole('button', { name: /nextbuttonlabel/i });
        await user.click(nextButton);

        // Should still show name input (not proceed without name)
        expect(
          screen.getByRole('textbox', {
            name: /fields\.name\.label/i,
          }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('step state across re-renders', () => {
    it('keeps typed provider details when the container re-renders', async () => {
      const user = userEvent.setup();

      const { customMessages: _cm, styling: _st, ...props } = createMockSsoProviderCreateProps();

      let rerenderContainer: () => void = () => undefined;
      function Container() {
        const [, setTick] = React.useState(0);
        rerenderContainer = () => setTick((tick) => tick + 1);
        return <SsoProviderCreate {...props} />;
      }

      renderWithProviders(<Container />, { queryClient });

      await waitForComponentToLoad();
      const strategyButtons = await waitForStrategyButtons();
      await user.click(strategyButtons[0]!);

      const nameInput = await screen.findByRole('textbox', { name: /fields\.name\.label/i });
      await user.type(nameInput, 'e2e-provider-name');
      expect(nameInput).toHaveValue('e2e-provider-name');

      await act(async () => {
        rerenderContainer();
      });

      expect(screen.getByRole('textbox', { name: /fields\.name\.label/i })).toHaveValue(
        'e2e-provider-name',
      );
    });
  });
});
