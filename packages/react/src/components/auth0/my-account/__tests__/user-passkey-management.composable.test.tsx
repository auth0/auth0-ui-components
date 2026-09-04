import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserPasskeyManagement } from '@/components/auth0/my-account/user-passkey-management.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const passkeyList = {
  authentication_methods: [
    { id: 'pk-1', type: 'passkey', name: 'My Passkey', created_at: '2024-01-01' },
  ],
};

describe('UserPasskeyManagement — composability', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the empty state and the add control when called directly', async () => {
      mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
        .fn()
        .mockResolvedValue({ authentication_methods: [] });

      renderWithProviders(<UserPasskeyManagement />);

      await screen.findByText('no_passkeys');
      expect(await screen.findByRole('button', { name: 'add_passkey' })).toBeInTheDocument();
    });

    it('renders the passkey list when the api returns passkeys', async () => {
      mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
        .fn()
        .mockResolvedValue(passkeyList);

      renderWithProviders(<UserPasskeyManagement />);

      await screen.findByText('passkey_name');
      expect(screen.getByText('enabled')).toBeInTheDocument();
    });
  });

  describe('Tier 2 — narrow replacement via render prop', () => {
    it('renders the host element and chains its onClick into the add command', async () => {
      const user = userEvent.setup();
      const hostOnClick = vi.fn();
      const addAction = { onBefore: vi.fn(() => true), onAfter: vi.fn() };

      renderWithProviders(
        <UserPasskeyManagement.Root addAction={addAction}>
          <UserPasskeyManagement.Header />
          <UserPasskeyManagement.AddAction
            render={
              <button type="button" onClick={hostOnClick}>
                Add key
              </button>
            }
          />
        </UserPasskeyManagement.Root>,
      );

      const hostButton = await screen.findByRole('button', { name: /add key/i });
      expect(hostButton).toBeInTheDocument();

      await user.click(hostButton);
      expect(hostOnClick).toHaveBeenCalledTimes(1);
      // The add flow started: the host handler chained into the model command.
      await waitFor(() => expect(addAction.onBefore).toHaveBeenCalledTimes(1));
    });

    it('skips the add command when the host cancels the event', async () => {
      const user = userEvent.setup();
      const addAction = { onBefore: vi.fn(() => true), onAfter: vi.fn() };

      renderWithProviders(
        <UserPasskeyManagement.Root addAction={addAction}>
          <UserPasskeyManagement.Header />
          <UserPasskeyManagement.AddAction
            render={
              <button type="button" onClick={(e) => e.preventDefault()}>
                Add key
              </button>
            }
          />
        </UserPasskeyManagement.Root>,
      );

      await user.click(await screen.findByRole('button', { name: /add key/i }));
      expect(addAction.onBefore).not.toHaveBeenCalled();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('renders host UI interleaved with a single component instance', async () => {
      mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
        .fn()
        .mockResolvedValue(passkeyList);

      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.Header />
          <div data-testid="host-panel">Host guidance</div>
          <UserPasskeyManagement.Content />
        </UserPasskeyManagement.Root>,
      );

      await screen.findByText('passkey_name');
      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      expect(screen.getByText('header.title')).toBeInTheDocument();
      // Parts share one model → the native Add control is rendered exactly once.
      expect(screen.getAllByRole('button', { name: 'add_passkey' })).toHaveLength(1);
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<UserPasskeyManagement.Content />)).toThrow(
        /must be rendered inside <UserPasskeyManagement.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
