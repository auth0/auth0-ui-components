import * as coreModule from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import * as gateKeeperContextModule from '@/providers/gate-keeper-context';
import {
  createMockCoreClient,
  createMockMfaApiClient,
} from '@/tests/utils/__mocks__/core/core-client.mocks';
import {
  mockMfaRequiredError,
  mock5xxError,
} from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { MfaStepUpSettings } from '@/types/mfa-step-up-types';

vi.mock('@/providers/gate-keeper-context');

const setupContext = (error: unknown = null, onRetry = vi.fn()) => {
  vi.mocked(gateKeeperContextModule.useGateKeeperContext).mockReturnValue({
    error,
    onRetry,
  } as ReturnType<typeof gateKeeperContextModule.useGateKeeperContext>);
};

const setupSystemError = (statusCode: number) => {
  vi.spyOn(coreModule, 'isMfaRequiredError').mockReturnValue(false);
  vi.spyOn(coreModule, 'getStatusCode').mockReturnValue(statusCode);
};

const setupMfaError = () => {
  vi.spyOn(coreModule, 'isMfaRequiredError').mockReturnValue(true);
  vi.spyOn(coreModule, 'getStatusCode').mockReturnValue(undefined);
  setupContext(mockMfaRequiredError);
};

describe('GateKeeper', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('no error', () => {
    it('renders children when there is no error and not loading', async () => {
      setupContext(null);

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      expect(await screen.findByText('child content')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows spinner and hides children when isLoading is true', () => {
      setupContext(null);

      renderWithProviders(
        <GateKeeper isLoading>
          <p>child content</p>
        </GateKeeper>,
      );

      expect(screen.queryByText('child content')).not.toBeInTheDocument();
    });
  });

  describe('5xx system error', () => {
    it('shows error fallback with retry button for 5xx errors', async () => {
      setupSystemError(503);
      setupContext(mock5xxError);

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      expect(await screen.findByText('fallback.title')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /fallback.retry/i })).toBeInTheDocument();
      expect(screen.queryByText('child content')).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRetry = vi.fn().mockResolvedValue(undefined);

      setupSystemError(500);
      setupContext(mock5xxError, mockOnRetry);

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      await user.click(await screen.findByRole('button', { name: /fallback.retry/i }));

      await waitFor(() => expect(mockOnRetry).toHaveBeenCalledTimes(1));
    });
  });

  describe('MFA required error', () => {
    it('shows MFA dialog overlaid on children without blocking them', async () => {
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(await screen.findByText('mfa.title')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /fallback.retry/i })).not.toBeInTheDocument();
      expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('shows the error fallback and retries nothing when the user dismisses the dialog', async () => {
      const onRetry = vi.fn();
      setupMfaError();
      setupContext(mockMfaRequiredError, onRetry);
      const user = userEvent.setup();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );
      await screen.findByRole('dialog');
      await user.keyboard('{Escape}');

      expect(await screen.findByText('fallback.title')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('child content')).not.toBeInTheDocument();
      expect(onRetry).not.toHaveBeenCalled();
    });

    it('retries when the user presses retry on the fallback after dismissing the dialog', async () => {
      const onRetry = vi.fn();
      setupMfaError();
      setupContext(mockMfaRequiredError, onRetry);
      const user = userEvent.setup();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );
      await screen.findByRole('dialog');
      await user.keyboard('{Escape}');
      await user.click(await screen.findByRole('button', { name: /fallback.retry/i }));

      await waitFor(() => expect(onRetry).toHaveBeenCalledTimes(1));
    });

    describe('with MFA step-up settings', () => {
      const renderWithSettings = (settings: MfaStepUpSettings) => {
        const apiClient = createMockMfaApiClient();
        vi.mocked(apiClient.getAuthenticators).mockResolvedValue([
          { id: 'rc-1', authenticatorType: 'recovery-code', active: true },
        ]);
        vi.mocked(apiClient.verify).mockResolvedValue({
          id_token: '',
          access_token: '',
          expires_in: 1,
        });
        setupMfaError();
        vi.mocked(gateKeeperContextModule.useGateKeeperContext).mockReturnValue({
          error: mockMfaRequiredError as Error,
          onRetry: vi.fn(),
          mfaStepUp: settings,
        });
        return renderWithProviders(
          <GateKeeper>
            <p>child content</p>
          </GateKeeper>,
          { coreClient: createMockCoreClient(undefined, apiClient) },
        );
      };

      it('shows the screen that replaces a built-in one', async () => {
        renderWithSettings({ screens: { list: () => <p>my own list</p> } });

        expect(await screen.findByText('my own list')).toBeInTheDocument();
      });

      it('aligns the buttons as the settings say', async () => {
        renderWithSettings({ actionsAlign: 'center' });

        await screen.findByRole('dialog');
        expect(document.querySelector('[data-actions-align="center"]')).not.toBeNull();
      });

      it('shows the screen of an added step', async () => {
        const user = userEvent.setup();
        renderWithSettings({
          flow: { add: [{ id: 'consent' }] },
          screens: { consent: () => <p>accept the terms</p> },
        });

        await user.click(await screen.findByRole('radio', { name: /mfa.method.recovery/ }));
        await user.click(screen.getByRole('button', { name: 'mfa.continue' }));
        await user.click(
          await screen.findByRole('button', { name: 'mfa.confirm.verify_selected' }),
        );
        await user.type(await screen.findByRole('textbox'), 'ABCD-1234');
        await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

        expect(await screen.findByText('accept the terms')).toBeInTheDocument();
      });
    });

    it('shows the error fallback with retry when the service fails during MFA', async () => {
      const onRetry = vi.fn();
      const apiClient = createMockMfaApiClient();
      vi.mocked(apiClient.getAuthenticators).mockRejectedValue(
        Object.assign(new Error('Bad Request'), {
          status: 400,
          data: { error: 'unknown_error', error_description: 'fetch failed' },
        }),
      );
      setupMfaError();
      setupContext(mockMfaRequiredError, onRetry);
      const user = userEvent.setup();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
        { coreClient: createMockCoreClient(undefined, apiClient) },
      );

      expect(await screen.findByText('fallback.title')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onRetry).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: /fallback.retry/i }));
      await waitFor(() => expect(onRetry).toHaveBeenCalledTimes(1));
    });

    it('emits console.warn in SPA mode', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      await screen.findByRole('dialog');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[Auth0 Components Warning]'));
    });

    it('does not emit console.warn in proxy mode', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
        { coreClient: { ...createMockCoreClient(), isProxyMode: () => true } },
      );

      await screen.findByRole('dialog');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
