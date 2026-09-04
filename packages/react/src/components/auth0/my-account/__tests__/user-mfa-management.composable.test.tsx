import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserMFAManagement } from '@/components/auth0/my-account/user-mfa-management.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockAuthenticator,
  createMockAuthenticationMethodsResponse,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UserMFAManagementProps } from '@/types/my-account/user-mfa-management/user-mfa-management-types';

mockToast();
const { initMockCoreClient } = mockCore();

const createMockUserMFAManagementProps = (
  overrides?: Partial<UserMFAManagementProps>,
): UserMFAManagementProps => ({
  hideHeader: false,
  showActiveOnly: false,
  disableEnroll: false,
  disableDelete: false,
  readOnly: false,
  factorConfig: {},
  ...overrides,
});

const waitForComponentToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
  });
};

const setupEnrolledTotpFactor = (
  apiService: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>,
) => {
  apiService.authenticationMethods.list = vi
    .fn()
    .mockResolvedValue(
      createMockAuthenticationMethodsResponse([
        createMockAuthenticator({ type: 'totp', enrolled: true }),
      ]),
    );
};

describe('UserMFAManagement — composability', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    setupEnrolledTotpFactor(mockCoreClient.getMyAccountApiClient());

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the factor cards and enroll buttons when called directly', async () => {
      renderWithProviders(<UserMFAManagement {...createMockUserMFAManagementProps()} />);
      await waitForComponentToLoad();

      await waitFor(() => {
        expect(screen.getByText('header.title')).toBeInTheDocument();
      });

      const enrollButtons = screen.getAllByRole('button', { name: /button_text/i });
      expect(enrollButtons.length).toBeGreaterThan(0);
    });

    it('renders the empty state when showActiveOnly and no active factors', async () => {
      const apiService = mockCoreClient.getMyAccountApiClient();
      apiService.authenticationMethods.list = vi
        .fn()
        .mockResolvedValue(createMockAuthenticationMethodsResponse([]));

      renderWithProviders(
        <UserMFAManagement {...createMockUserMFAManagementProps({ showActiveOnly: true })} />,
      );
      await waitForComponentToLoad();

      await screen.findByText(/no_active_mfa/i);
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('renders host UI interleaved with a single component instance', async () => {
      renderWithProviders(
        <UserMFAManagement.Root {...createMockUserMFAManagementProps()}>
          <UserMFAManagement.Header />
          <div data-testid="host-panel">Host guidance</div>
          <UserMFAManagement.Content />
        </UserMFAManagement.Root>,
      );
      await waitForComponentToLoad();

      // Host UI is rendered alongside the component parts.
      expect(screen.getByTestId('host-panel')).toBeInTheDocument();

      // Parts share one model provided by Root: a duplicated model would render a
      // second header. The Header part renders the only banner/title; Content
      // suppresses its own header (hideHeader).
      expect(screen.getAllByRole('banner')).toHaveLength(1);
      expect(screen.getAllByText('header.title')).toHaveLength(1);

      // Content is wired to the shared model and renders the factor cards.
      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /button_text/i }).length).toBeGreaterThan(0);
      });
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<UserMFAManagement.Content />)).toThrow(
        /must be rendered inside <UserMFAManagement.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
