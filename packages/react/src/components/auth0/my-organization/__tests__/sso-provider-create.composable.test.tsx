import { AVAILABLE_STRATEGY_LIST, idpConfigQueryKeys } from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderCreate } from '@/components/auth0/my-organization/sso-provider-create.composable';
import * as useConfigModule from '@/hooks/my-organization/shared/services/use-config-service';
import * as useIdpConfigModule from '@/hooks/my-organization/shared/services/use-idp-config-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
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

describe('SsoProviderCreate — composability', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let queryClient: QueryClient;

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

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the wizard and strategy step when called directly', async () => {
      renderWithProviders(<SsoProviderCreate {...createMockSsoProviderCreateProps()} />, {
        queryClient,
      });

      await waitForComponentToLoad();

      expect(screen.getByTestId('sso-provider-create-content')).toBeInTheDocument();
      const strategyButtons = await waitForStrategyButtons();
      expect(strategyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('renders host UI interleaved with a single wizard instance', async () => {
      const mockBackButton = createMockBackButton();

      renderWithProviders(
        <SsoProviderCreate.Root
          {...createMockSsoProviderCreateProps({ backButton: mockBackButton })}
        >
          <div data-testid="host-panel">Host guidance</div>
          <SsoProviderCreate.Content />
        </SsoProviderCreate.Root>,
        { queryClient },
      );

      await waitForComponentToLoad();

      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      // Parts read the single model provided by Root via context => one wizard.
      expect(screen.getAllByTestId('sso-provider-create-content')).toHaveLength(1);
      const strategyButtons = await waitForStrategyButtons();
      expect(strategyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('context safety', () => {
    it('throws when Content is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<SsoProviderCreate.Content />)).toThrow(
        /must be rendered inside <SsoProviderCreate.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
