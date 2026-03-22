import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { AuthenticatorsList } from '@/components/auth0/shared/gate-keeper/mfa-step-up/authenticators-list';
import { renderWithProviders, mockMfaRequiredError, mockUseMfaRequirements } from '@/tests/utils';

vi.mock('@/hooks/shared/use-mfa-requirements');

const mockError = mockMfaRequiredError;

const defaultProps = {
  error: mockError,
  onSelectFactor: vi.fn(),
  onSelectAuthenticator: vi.fn(),
  onCancel: vi.fn(),
};

describe('AuthenticatorsList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders a spinner while loading', () => {
      mockUseMfaRequirements({ isLoading: true });
      renderWithProviders(<AuthenticatorsList {...defaultProps} />);

      // When loading, should show spinner, not list
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows no_authenticators message when both factors and authenticators are empty', async () => {
      mockUseMfaRequirements();
      renderWithProviders(<AuthenticatorsList {...defaultProps} />);

      expect(await screen.findByText('mfa.no_authenticators')).toBeInTheDocument();
    });
  });

  describe('enroll mode (factors)', () => {
    it('renders factor items with enroll buttons', async () => {
      mockUseMfaRequirements({
        factors: [{ type: 'otp' as const }, { type: 'sms' as const }],
        isEnrollMode: true,
      });

      renderWithProviders(<AuthenticatorsList {...defaultProps} />);

      const enrollButtons = await screen.findAllByRole('button', { name: /mfa.enroll_button/i });
      expect(enrollButtons).toHaveLength(2);
    });

    it('calls onSelectFactor with the correct factor when enroll button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelectFactor = vi.fn();
      const otpFactor = { type: 'otp' as const };

      mockUseMfaRequirements({
        factors: [otpFactor],
        isEnrollMode: true,
      });

      renderWithProviders(
        <AuthenticatorsList {...defaultProps} onSelectFactor={mockOnSelectFactor} />,
      );

      await user.click(await screen.findByRole('button', { name: /mfa.enroll_button/i }));

      expect(mockOnSelectFactor).toHaveBeenCalledWith(otpFactor);
    });

    it('disables all factor buttons after one is selected', async () => {
      const user = userEvent.setup();
      mockUseMfaRequirements({
        factors: [{ type: 'otp' as const }, { type: 'sms' as const }],
        isEnrollMode: true,
      });

      renderWithProviders(<AuthenticatorsList {...defaultProps} />);

      const [firstButton] = await screen.findAllByRole('button', { name: /mfa.enroll_button/i });
      await user.click(firstButton!);

      await waitFor(() => {
        screen.getAllByRole('button', { name: /mfa.enroll_button/i }).forEach((btn) => {
          expect(btn).toBeDisabled();
        });
      });
    });
  });

  describe('challenge mode (authenticators)', () => {
    it('renders authenticator items with verify buttons', async () => {
      mockUseMfaRequirements({
        authenticators: [
          {
            id: 'auth-1',
            authenticatorType: 'oob',
            active: true,
            type: 'sms',
            name: 'SMS',
          } as never,
          {
            id: 'auth-2',
            authenticatorType: 'otp',
            active: true,
            type: 'otp',
            name: 'OTP',
          } as never,
        ],
        isEnrollMode: false,
      });

      renderWithProviders(<AuthenticatorsList {...defaultProps} />);

      const verifyButtons = await screen.findAllByRole('button', { name: /mfa.verify_button/i });
      expect(verifyButtons).toHaveLength(2);
    });

    it('calls onSelectAuthenticator with the correct authenticator when verify button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelectAuthenticator = vi.fn();
      const authenticator = {
        id: 'auth-1',
        authenticatorType: 'oob',
        active: true,
        type: 'sms',
        name: 'SMS',
      } as never;

      mockUseMfaRequirements({
        authenticators: [authenticator],
        isEnrollMode: false,
      });

      renderWithProviders(
        <AuthenticatorsList {...defaultProps} onSelectAuthenticator={mockOnSelectAuthenticator} />,
      );

      await user.click(await screen.findByRole('button', { name: /mfa.verify_button/i }));

      expect(mockOnSelectAuthenticator).toHaveBeenCalledWith(authenticator);
    });
  });

  describe('cancel button', () => {
    it('renders cancel button in list view', async () => {
      mockUseMfaRequirements({
        authenticators: [{ id: 'auth-1', authenticatorType: 'otp', active: true } as never],
      });

      renderWithProviders(<AuthenticatorsList {...defaultProps} />);

      expect(await screen.findByRole('button', { name: 'mfa.cancel' })).toBeInTheDocument();
    });

    it('calls onCancel when cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();

      mockUseMfaRequirements({
        authenticators: [{ id: 'auth-1', authenticatorType: 'otp', active: true } as never],
      });

      renderWithProviders(<AuthenticatorsList {...defaultProps} onCancel={mockOnCancel} />);

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
