import { idpConfigQueryKeys } from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderTable } from '@/components/auth0/my-organization/sso-provider-table.composable';
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

const createProps = (overrides?: Partial<SsoProviderTableProps>): SsoProviderTableProps => ({
  customMessages: {},
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly: false,
  createAction: { disabled: false, onBefore: vi.fn(() => true), onAfter: vi.fn() },
  editAction: { disabled: false, onBefore: vi.fn(() => true), onAfter: vi.fn() },
  deleteAction: undefined,
  deleteFromOrganizationAction: {},
  enableProviderAction: undefined,
  ...overrides,
});

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

const waitForLoad = async () =>
  waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

describe('SsoProviderTable — composability', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(idpConfigQueryKeys.config(), createMockIdpConfig());

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      identity_providers: [mockProvider],
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(createMockUseConfig());
    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(createMockUseIdpConfig());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the table and create button when called directly', async () => {
      renderWithProviders(<SsoProviderTable {...createProps()} />, { queryClient });
      await waitForLoad();

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  describe('Tier 2 — narrow replacement via render prop', () => {
    it('renders the host element and chains its onClick into the create command', async () => {
      const user = userEvent.setup();
      const hostOnClick = vi.fn();
      const createAction = { disabled: false, onBefore: vi.fn(() => true), onAfter: vi.fn() };

      renderWithProviders(
        <SsoProviderTable.Root {...createProps({ createAction })}>
          <SsoProviderTable.DefaultLayout>
            <SsoProviderTable.CreateAction
              render={
                <button type="button" onClick={hostOnClick}>
                  Add connection
                </button>
              }
            />
          </SsoProviderTable.DefaultLayout>
        </SsoProviderTable.Root>,
        { queryClient },
      );
      await waitForLoad();

      const hostButton = screen.getByRole('button', { name: /add connection/i });
      expect(hostButton).toBeInTheDocument();

      await user.click(hostButton);
      expect(hostOnClick).toHaveBeenCalledTimes(1);
      expect(createAction.onAfter).toHaveBeenCalledTimes(1);
    });

    it('skips the create command when the host cancels the event', async () => {
      const user = userEvent.setup();
      const createAction = { disabled: false, onBefore: vi.fn(() => true), onAfter: vi.fn() };

      renderWithProviders(
        <SsoProviderTable.Root {...createProps({ createAction })}>
          <SsoProviderTable.DefaultLayout>
            <SsoProviderTable.CreateAction
              render={
                <button type="button" onClick={(e) => e.preventDefault()}>
                  Add connection
                </button>
              }
            />
          </SsoProviderTable.DefaultLayout>
        </SsoProviderTable.Root>,
        { queryClient },
      );
      await waitForLoad();

      await user.click(screen.getByRole('button', { name: /add connection/i }));
      expect(createAction.onAfter).not.toHaveBeenCalled();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('omits the refresh region and renders host UI interleaved', async () => {
      renderWithProviders(
        <SsoProviderTable.Root {...createProps()}>
          <SsoProviderTable.Header />
          <div data-testid="host-panel">Host guidance</div>
          <SsoProviderTable.Content />
        </SsoProviderTable.Root>,
        { queryClient },
      );
      await waitForLoad();

      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      // No Refresh part rendered => no refresh control present.
      expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
    });

    it('renders a single table (parts share one model, no duplication)', async () => {
      renderWithProviders(
        <SsoProviderTable.Root {...createProps()}>
          <SsoProviderTable.Header />
          <SsoProviderTable.Refresh />
          <SsoProviderTable.Content />
        </SsoProviderTable.Root>,
        { queryClient },
      );
      await waitForLoad();

      // A duplicated model would render a second table/header. Parts read the
      // single model provided by Root via context.
      expect(screen.getAllByRole('table')).toHaveLength(1);
      await waitFor(() => expect(screen.getByText(mockProvider.name!)).toBeInTheDocument());
    });
  });

  describe('Tier 4 — headless alias', () => {
    it('re-exports the model hook under the stable name', async () => {
      const mod = await import('@/index');
      expect(mod.useSsoProviderTableModel).toBe(mod.useSsoProviderTable);
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<SsoProviderTable.Content />)).toThrow(
        /must be rendered inside <SsoProviderTable.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
