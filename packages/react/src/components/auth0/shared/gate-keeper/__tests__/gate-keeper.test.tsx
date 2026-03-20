import * as coreModule from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import * as gateKeeperContextModule from '@/providers/gate-keeper-context';
import {
  renderWithProviders,
  mockMfaRequiredError,
  mock5xxError,
  mockUseMfaRequirements,
  mockUseMfaStepUp,
} from '@/tests/utils';

vi.mock('@/hooks/shared/use-mfa-requirements');
vi.mock('@/hooks/shared/use-mfa-step-up');
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
  mockUseMfaRequirements();
  mockUseMfaStepUp();
  vi.spyOn(coreModule, 'isMfaRequiredError').mockReturnValue(true);
  vi.spyOn(coreModule, 'normalizeMfaRequiredError').mockReturnValue(mockMfaRequiredError as never);
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
    it('renders children underneath MFA dialog when MFA error is present', async () => {
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      expect(await screen.findByText('child content')).toBeInTheDocument();
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('shows error fallback after MFA dialog is dismissed', async () => {
      const user = userEvent.setup();
      setupMfaError();

      renderWithProviders(
        <GateKeeper>
          <p>child content</p>
        </GateKeeper>,
      );

      await screen.findByRole('dialog');

      // Dismiss via cancel button inside AuthenticatorsList empty state
      const cancelButton = await screen.findByRole('button', { name: 'mfa.cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText('fallback.title')).toBeInTheDocument();
      });
    });
  });
});
