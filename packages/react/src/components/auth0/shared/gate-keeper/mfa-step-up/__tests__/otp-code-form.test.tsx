import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { OtpCodeForm } from '@/components/auth0/shared/gate-keeper/mfa-step-up/otp-code-form';
import { renderWithProviders } from '@/tests/utils/test-provider';

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
    it('renders six digit boxes for a one-time code', async () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} />);

      expect(await screen.findAllByRole('textbox')).toHaveLength(6);
    });

    it('renders one text input for a recovery code', async () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} isRecoveryCode />);

      expect(await screen.findAllByRole('textbox')).toHaveLength(1);
    });

    it('shows the footer under the field', async () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} footer={<p>another way</p>} />);

      expect(await screen.findByText('another way')).toBeInTheDocument();
    });

    it('renders resend link when onResend is provided', async () => {
      renderWithProviders(
        <OtpCodeForm {...defaultProps} onResend={vi.fn().mockResolvedValue(undefined)} />,
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
      renderWithProviders(<OtpCodeForm {...defaultProps} isRecoveryCode />);

      const verifyButton = await screen.findByRole('button', { name: 'mfa.verify_button' });
      expect(verifyButton).toBeDisabled();
    });

    it('shows verifying label and disables verify button when isLoading is true', async () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} isLoading />);

      expect(await screen.findByRole('button', { name: 'mfa.challenge.verifying' })).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('puts Verify before Cancel', async () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} />);

      const buttons = await screen.findAllByRole('button');
      expect(buttons.map((button) => button.textContent)).toEqual([
        'mfa.verify_button',
        'mfa.cancel',
      ]);
    });

    it('labels the cancel button as asked', async () => {
      renderWithProviders(<OtpCodeForm {...defaultProps} cancelLabel="mfa.back" />);

      expect(await screen.findByRole('button', { name: 'mfa.back' })).toBeInTheDocument();
    });

    it('calls onCancel when cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();

      renderWithProviders(<OtpCodeForm {...defaultProps} onCancel={mockOnCancel} />);

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit with entered recovery code on form submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      renderWithProviders(<OtpCodeForm {...defaultProps} onSubmit={mockOnSubmit} isRecoveryCode />);

      const input = await screen.findByRole('textbox');
      await user.type(input, 'RECOVERY-CODE-123');

      const verifyButton = screen.getByRole('button', { name: 'mfa.verify_button' });
      await user.click(verifyButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('RECOVERY-CODE-123');
    });

    it('calls onResend when resend link is clicked', async () => {
      const user = userEvent.setup();
      const mockOnResend = vi.fn().mockResolvedValue(undefined);

      renderWithProviders(<OtpCodeForm {...defaultProps} onResend={mockOnResend} />);

      await user.click(await screen.findByText('mfa.challenge.resend'));

      expect(mockOnResend).toHaveBeenCalledTimes(1);
    });
  });
});
