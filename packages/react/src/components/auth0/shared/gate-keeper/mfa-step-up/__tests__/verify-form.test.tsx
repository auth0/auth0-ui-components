import { screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { VerifyForm } from '@/components/auth0/shared/gate-keeper/mfa-step-up/verify-form';
import { Dialog } from '@/components/ui/dialog';
import { renderWithProviders, mockMfaRequiredError, mockUseMfaStepUp } from '@/tests/utils';

const render = (ui: React.ReactElement) => renderWithProviders(<Dialog open>{ui}</Dialog>);

vi.mock('@/hooks/shared/use-mfa-step-up');

const mockError = mockMfaRequiredError;

const otpAuthenticator = { id: 'auth-1', authenticatorType: 'otp' as const };
const oobSmsAuthenticator = {
  id: 'auth-2',
  authenticatorType: 'oob' as const,
  oobCode: 'oob-code-123',
  type: 'sms',
  name: '+1234567890',
};
const pushAuthenticator = {
  id: 'auth-3',
  authenticatorType: 'oob' as const,
  oobCode: 'oob-code-push',
  type: 'push-notification',
};
const recoveryAuthenticator = { id: 'auth-4', authenticatorType: 'recovery-code' as const };

describe('VerifyForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('OTP authenticator', () => {
    it('calls verify with otp on submit', async () => {
      const user = userEvent.setup();
      const mockVerify = vi.fn().mockResolvedValue(undefined);
      mockUseMfaStepUp({ verify: mockVerify });

      render(
        <VerifyForm
          error={mockError}
          authenticator={otpAuthenticator}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const inputs = await screen.findAllByRole('textbox');
      await user.type(inputs[0]!, '123456');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => {
        expect(mockVerify).toHaveBeenCalledWith({
          mfaToken: mockError.mfa_token,
          otp: '123456',
        });
      });
    });
  });

  describe('recovery-code authenticator', () => {
    it('calls verify with recovery code on submit', async () => {
      const user = userEvent.setup();
      const mockVerify = vi.fn().mockResolvedValue(undefined);
      mockUseMfaStepUp({ verify: mockVerify });

      render(
        <VerifyForm
          error={mockError}
          authenticator={recoveryAuthenticator}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const input = await screen.findByRole('textbox');
      await user.type(input, 'RECOVERY-CODE-XYZ');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => {
        expect(mockVerify).toHaveBeenCalledWith({
          mfaToken: mockError.mfa_token,
          recoveryCode: 'RECOVERY-CODE-XYZ',
        });
      });
    });
  });

  describe('OOB (SMS) authenticator', () => {
    it('calls verify with oobCode and binding code on submit', async () => {
      const user = userEvent.setup();
      const mockVerify = vi.fn().mockResolvedValue(undefined);
      mockUseMfaStepUp({ verify: mockVerify });

      render(
        <VerifyForm
          error={mockError}
          authenticator={oobSmsAuthenticator}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const inputs = await screen.findAllByRole('textbox');
      await user.type(inputs[0]!, '123456');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => {
        expect(mockVerify).toHaveBeenCalledWith({
          mfaToken: mockError.mfa_token,
          oobCode: oobSmsAuthenticator.oobCode,
          bindingCode: '123456',
        });
      });
    });
  });

  describe('Push authenticator', () => {
    it('renders push waiting title and message', async () => {
      mockUseMfaStepUp();

      render(
        <VerifyForm
          error={mockError}
          authenticator={pushAuthenticator}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(await screen.findByText('mfa.challenge.push_title')).toBeInTheDocument();
      expect(await screen.findByText('mfa.challenge.push_waiting')).toBeInTheDocument();
    });

    it('calls onCancel when cancel is clicked in push view', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      mockUseMfaStepUp();

      render(
        <VerifyForm
          error={mockError}
          authenticator={pushAuthenticator}
          onComplete={vi.fn()}
          onCancel={mockOnCancel}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onComplete when continue is clicked in push view', async () => {
      const user = userEvent.setup();
      const mockOnComplete = vi.fn();
      mockUseMfaStepUp();

      render(
        <VerifyForm
          error={mockError}
          authenticator={pushAuthenticator}
          onComplete={mockOnComplete}
          onCancel={vi.fn()}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.continue' }));

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('OOB without existing oobCode', () => {
    it('shows spinner while challenge is being initiated', () => {
      mockUseMfaStepUp({
        challenge: vi.fn().mockReturnValue(new Promise(() => {})),
      });

      render(
        <VerifyForm
          error={mockError}
          authenticator={{ id: 'auth-5', authenticatorType: 'oob' as const, type: 'sms' }}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      // Spinner is shown while not yet challenged
      expect(screen.queryByRole('button', { name: 'mfa.verify_button' })).not.toBeInTheDocument();
    });

    it('shows code form after challenge resolves', async () => {
      mockUseMfaStepUp({
        challenge: vi.fn().mockResolvedValue({ oobCode: 'new-oob-code' }),
      });

      render(
        <VerifyForm
          error={mockError}
          authenticator={{ id: 'auth-5', authenticatorType: 'oob' as const, type: 'sms' }}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'mfa.verify_button' })).toBeInTheDocument();
      });
    });
  });

  describe('back navigation', () => {
    it('calls onCancel when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      mockUseMfaStepUp();

      render(
        <VerifyForm
          error={mockError}
          authenticator={oobSmsAuthenticator}
          onComplete={vi.fn()}
          onCancel={mockOnCancel}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
