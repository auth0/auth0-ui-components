import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderEdit } from '@/components/auth0/my-organization/sso-provider-edit.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockIdentityProvider } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { createMockSsoProviderEditProps } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-edit/sso-provider-edit.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const waitForComponentToLoad = async () => {
  return await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
};

describe('SsoProviderEdit — composability', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

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

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the editor with the provider name header and tabs when called directly', async () => {
      renderWithProviders(<SsoProviderEdit {...createMockSsoProviderEditProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByText(mockProvider.display_name!)).toBeInTheDocument();
      expect(screen.getByText(/tabs.sso.name/i)).toBeInTheDocument();
      expect(screen.getByText(/tabs.domains.name/i)).toBeInTheDocument();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('renders host UI interleaved and a single editor instance sharing one model', async () => {
      renderWithProviders(
        <SsoProviderEdit.Root {...createMockSsoProviderEditProps()}>
          <SsoProviderEdit.Header />
          <div data-testid="host-panel">Host guidance</div>
          <SsoProviderEdit.Content />
        </SsoProviderEdit.Root>,
      );
      await waitForComponentToLoad();

      // Host UI is interleaved with the editor parts.
      expect(screen.getByTestId('host-panel')).toBeInTheDocument();

      // Header title and tabs render exactly once => parts share Root's model,
      // no duplicated editor instance.
      expect(screen.getByText(mockProvider.display_name!)).toBeInTheDocument();
      expect(screen.getAllByRole('tablist')).toHaveLength(1);

      // The header's single enable/disable toggle is present.
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<SsoProviderEdit.Content />)).toThrow(
        /must be rendered inside <SsoProviderEdit.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
