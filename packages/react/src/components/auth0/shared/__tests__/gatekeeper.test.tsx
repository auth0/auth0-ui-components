import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GateKeeper } from '@/components/auth0/shared/gatekeeper';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  createMockCoreClient,
  setupMockUseCoreClient,
  setupMockUseTranslator,
} from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

describe('GateKeeper', () => {
  const mockOnRetry = vi.fn(async () => {});
  let mockCoreClient: ReturnType<typeof createMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = createMockCoreClient();

    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    setupMockUseTranslator(useTranslatorModule);
  });

  const renderGateKeeper = (props: {
    isLoading?: boolean;
    error?: unknown;
    onRetry?: () => Promise<void>;
  }) => {
    const { wrapper } = createTestQueryClientWrapper();
    return render(
      <GateKeeper
        isLoading={props.isLoading}
        error={props.error}
        onRetry={props.onRetry || mockOnRetry}
      >
        <div data-testid="children">Children Content</div>
      </GateKeeper>,
      { wrapper },
    );
  };

  describe('Loading State', () => {
    it('should show spinner when loading', () => {
      renderGateKeeper({ isLoading: true });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render children when no error', () => {
      renderGateKeeper({ error: null });

      expect(screen.getByTestId('children')).toBeInTheDocument();
      expect(screen.getByText('Children Content')).toBeInTheDocument();
    });
  });

  describe('500+ Error Handling', () => {
    it('should show error fallback for 500 error', () => {
      const error = { body: { status: 500 } };
      renderGateKeeper({ error });

      expect(screen.getByText('fallback.title')).toBeInTheDocument();
      expect(screen.getByText('fallback.description')).toBeInTheDocument();
      expect(screen.getByText('fallback.retry')).toBeInTheDocument();
      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });

    it('should show error fallback for 503 error', () => {
      const error = { body: { status: 503 } };
      renderGateKeeper({ error });

      expect(screen.getByText('fallback.title')).toBeInTheDocument();
      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const error = { body: { status: 500 } };
      const onRetry = vi.fn(async (): Promise<void> => {});

      renderGateKeeper({ error, onRetry });

      const retryButton = screen.getByRole('button', { name: /fallback.retry/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should show spinner in button during retry', async () => {
      const user = userEvent.setup();
      const error = { body: { status: 500 } };
      const onRetry = vi.fn(
        async (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      renderGateKeeper({ error, onRetry });

      const retryButton = screen.getByRole('button', { name: /fallback.retry/i });

      await user.click(retryButton);

      await waitFor(() => {
        expect(retryButton).toBeDisabled();
      });

      await waitFor(() => {
        expect(retryButton).not.toBeDisabled();
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('MFA Error Handling', () => {
    const mfaError = {
      body: {
        error: 'mfa_required',
        mfa_token: 'test-mfa-token',
      },
      mfa_token: 'test-mfa-token',
    };

    it('should show MFA dialog for MFA error in proxy mode', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi.fn().mockResolvedValue([
        {
          id: 'auth-1',
          authenticatorType: 'otp',
          name: 'Google Authenticator',
          active: true,
        },
      ]);

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('error.mfa.title')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Google Authenticator')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });

    it('should show enrollment list in SPA mode when enrollment needed', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(false);
      mockCoreClient.getStepUpApiService().getEnrollmentFactors = vi.fn().mockResolvedValue([
        { type: 'otp', name: 'OTP' },
        { type: 'sms', name: 'SMS' },
      ]);

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('error.mfa.enrollment_required')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('otp')).toBeInTheDocument();
        expect(screen.getByText('sms')).toBeInTheDocument();
      });
    });

    it('should show authenticators in SPA mode when no enrollment needed', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(false);
      mockCoreClient.getStepUpApiService().getEnrollmentFactors = vi.fn().mockResolvedValue([]);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi.fn().mockResolvedValue([
        {
          id: 'auth-1',
          authenticatorType: 'sms',
          name: 'SMS Auth',
          active: true,
        },
      ]);

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('SMS Auth')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching MFA data', () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 1000)));

      renderGateKeeper({ error: mfaError });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state when fetching MFA data fails', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi
        .fn()
        .mockRejectedValue(new Error('Failed to fetch'));

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('error.mfa.fetch_failed')).toBeInTheDocument();
      });
    });

    it('should show empty state when no authenticators', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi.fn().mockResolvedValue([]);

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('error.mfa.no_authenticators')).toBeInTheDocument();
      });
    });

    it('should show error fallback when MFA dialog is closed', async () => {
      const user = userEvent.setup();
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi.fn().mockResolvedValue([
        {
          id: 'auth-1',
          authenticatorType: 'otp',
          name: 'OTP Auth',
          active: true,
        },
      ]);

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('error.mfa.title')).toBeInTheDocument();
      });

      // Close the dialog
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.getByText('fallback.title')).toBeInTheDocument();
      });
    });

    it('should extract mfa_token from error.body if not at root level', async () => {
      const errorWithNestedToken = {
        body: {
          error: 'mfa_required',
          mfa_token: 'nested-token',
        },
      };

      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi.fn().mockResolvedValue([]);

      renderGateKeeper({ error: errorWithNestedToken });

      await waitFor(() => {
        expect(mockCoreClient.getStepUpApiService().getAuthenticators).toHaveBeenCalledWith(
          'nested-token',
        );
      });
    });

    it('should show authenticator details with type and active status', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
      mockCoreClient.getStepUpApiService().getAuthenticators = vi.fn().mockResolvedValue([
        {
          id: 'auth-1',
          authenticatorType: 'otp',
          name: 'Test Authenticator',
          active: true,
        },
        {
          id: 'auth-2',
          authenticatorType: 'webauthn-roaming',
          name: null,
          active: false,
        },
      ]);

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('Test Authenticator')).toBeInTheDocument();
        expect(screen.getByText(/Type: otp/)).toBeInTheDocument();
        expect(screen.getByText(/Active: Yes/)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('webauthn-roaming')).toBeInTheDocument();
        expect(screen.getByText(/Active: No/)).toBeInTheDocument();
      });
    });
  });

  describe('Non-500 Errors', () => {
    it('should render children for 400 errors', () => {
      const error = { body: { status: 400 } };
      renderGateKeeper({ error });

      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    it('should render children for 404 errors', () => {
      const error = { body: { status: 404 } };
      renderGateKeeper({ error });

      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    it('should render children for errors without status code', () => {
      const error = new Error('Generic error');
      renderGateKeeper({ error });

      expect(screen.getByTestId('children')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle MFA error without mfa_token', async () => {
      const mfaErrorNoToken = {
        body: {
          error: 'mfa_required',
        },
      };

      renderGateKeeper({ error: mfaErrorNoToken });

      // Should show dialog but with empty state since we don't have a token
      await waitFor(() => {
        expect(screen.getByText('error.mfa.title')).toBeInTheDocument();
        expect(screen.getByText('error.mfa.no_authenticators')).toBeInTheDocument();
      });
    });

    it('should handle enrollment factors fetch error in SPA mode', async () => {
      mockCoreClient.isProxyMode = vi.fn().mockReturnValue(false);
      mockCoreClient.getStepUpApiService().getEnrollmentFactors = vi
        .fn()
        .mockRejectedValue(new Error('Failed to fetch enrollment factors'));

      const mfaError = {
        body: {
          error: 'mfa_required',
          mfa_token: 'test-token',
        },
        mfa_token: 'test-token',
      };

      renderGateKeeper({ error: mfaError });

      await waitFor(() => {
        expect(screen.getByText('error.mfa.fetch_failed')).toBeInTheDocument();
      });
    });
  });
});
