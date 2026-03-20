import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { OtpCodeForm } from '@/components/auth0/shared/gate-keeper/mfa-step-up/otp-code-form';
import { renderWithProviders } from '@/tests/utils';

const defaultProps = {
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
  isLoading: false,
};

describe('OtpCodeForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders OTP input and description for OTP authenticator', async () => {
      renderWithProviders(
        <OtpCodeForm {...defaultProps} authenticator={{ authenticatorType: 'otp' }} />,
      );

      const inputs = await screen.findAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
      expect(await screen.findByText('mfa.challenge.otp_description')).toBeInTheDocument();
    });

    it('renders text input and description for recovery-code authenticator', async () => {
      renderWithProviders(
        <OtpCodeForm {...defaultProps} authenticator={{ authenticatorType: 'recovery-code' }} />,
      );

      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      expect(
        await screen.findByText('mfa.challenge.recovery_code_description'),
      ).toBeInTheDocument();
    });

    it('shows code_sent description when authenticator has a name', async () => {
      renderWithProviders(
        <OtpCodeForm
          {...defaultProps}
          authenticator={{ authenticatorType: 'oob', name: 'user@example.com' }}
        />,
      );

      expect(await screen.findByText('mfa.challenge.code_sent_description')).toBeInTheDocument();
    });

    it('renders resend link when onResend is provided', async () => {
      renderWithProviders(
        <OtpCodeForm
          {...defaultProps}
          authenticator={{ authenticatorType: 'oob' }}
          onResend={vi.fn().mockResolvedValue(undefined)}
        />,
      );

      expect(await screen.findByText('mfa.challenge.resend')).toBeInTheDocument();
    });

    it('does not render resend link when onResend is not provided', () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} />);

      expect(screen.queryByText('mfa.challenge.resend')).not.toBeInTheDocument();
    });
  });

  describe('button state', () => {
    it('disables verify button initially when no code is entered', async () => {
      renderWithProviders(
        <OtpCodeForm {...defaultProps} authenticator={{ authenticatorType: 'recovery-code' }} />,
      );

      const verifyButton = await screen.findByRole('button', { name: 'mfa.verify_button' });
      expect(verifyButton).toBeDisabled();
    });

    it('shows verifying label and disables verify button when isLoading is true', async () => {
      renderWithProviders(
        <OtpCodeForm {...defaultProps} isLoading authenticator={{ authenticatorType: 'oob' }} />,
      );

      expect(await screen.findByRole('button', { name: 'mfa.challenge.verifying' })).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('calls onCancel when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();

      renderWithProviders(<OtpCodeForm {...defaultProps} onCancel={mockOnCancel} />);

      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit with entered recovery code on form submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <OtpCodeForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
          authenticator={{ authenticatorType: 'recovery-code' }}
        />,
      );

      const input = await screen.findByRole('textbox');
      await user.type(input, 'RECOVERY-CODE-123');

      const verifyButton = screen.getByRole('button', { name: 'mfa.verify_button' });
      await user.click(verifyButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('RECOVERY-CODE-123');
    });

    it('calls onResend when resend link is clicked', async () => {
      const user = userEvent.setup();
      const mockOnResend = vi.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <OtpCodeForm
          {...defaultProps}
          authenticator={{ authenticatorType: 'oob' }}
          onResend={mockOnResend}
        />,
      );

      await user.click(await screen.findByText('mfa.challenge.resend'));

      expect(mockOnResend).toHaveBeenCalledTimes(1);
    });
  });
});
