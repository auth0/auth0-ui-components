import * as coreModule from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import * as gateKeeperContextModule from '@/providers/gate-keeper-context';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import {
  mockMfaRequiredError,
  mock5xxError,
} from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

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
    it('shows MFA error fallback without retry button', async () => {
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      expect(await screen.findByText('mfa_error.title')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /fallback.retry/i })).not.toBeInTheDocument();
      expect(screen.queryByText('child content')).not.toBeInTheDocument();
    });

    it('emits console.warn in SPA mode', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      await screen.findByText('mfa_error.title');
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

      await screen.findByText('mfa_error.title');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
