import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { ShowRecoveryCode } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/show-recovery-code';
import { renderWithProviders, createMockShowRecoveryCodeProps, TestProvider } from '@/tests/utils';

describe('ShowRecoveryCode', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the recovery code', () => {
      renderWithProviders(
        <ShowRecoveryCode
          {...createMockShowRecoveryCodeProps({ recoveryCode: 'ABCD-EFGH-IJKL-MNOP' })}
        />,
      );

      expect(screen.getByDisplayValue('ABCD-EFGH-IJKL-MNOP')).toBeInTheDocument();
    });

    it('renders the confirmation checkbox unchecked by default', () => {
      renderWithProviders(<ShowRecoveryCode {...createMockShowRecoveryCodeProps()} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders back and submit buttons', () => {
      renderWithProviders(<ShowRecoveryCode {...createMockShowRecoveryCodeProps()} />);

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('shows spinner when loading', () => {
      renderWithProviders(
        <ShowRecoveryCode {...createMockShowRecoveryCodeProps({ isLoading: true })} />,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('submit button is disabled until checkbox is checked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ShowRecoveryCode {...createMockShowRecoveryCodeProps()} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();

      await user.click(screen.getByRole('checkbox'));
      expect(submitButton).not.toBeDisabled();
    });

    it('calls onConfirmRecoveryCode when submit is clicked after confirming', async () => {
      const user = userEvent.setup();
      const onConfirmRecoveryCode = vi.fn();

      renderWithProviders(
        <ShowRecoveryCode {...createMockShowRecoveryCodeProps({ onConfirmRecoveryCode })} />,
      );

      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(onConfirmRecoveryCode).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when back button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(<ShowRecoveryCode {...createMockShowRecoveryCodeProps({ onClose })} />);

      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('resets checkbox when recoveryCode changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TestProvider>
          <ShowRecoveryCode {...createMockShowRecoveryCodeProps({ recoveryCode: 'CODE-1111' })} />
        </TestProvider>,
      );

      await user.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).toBeChecked();

      rerender(
        <TestProvider>
          <ShowRecoveryCode {...createMockShowRecoveryCodeProps({ recoveryCode: 'CODE-2222' })} />
        </TestProvider>,
      );

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('accessibility', () => {
    it('checkbox has associated label', () => {
      renderWithProviders(<ShowRecoveryCode {...createMockShowRecoveryCodeProps()} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByLabelText(/enrollment\.recovery_code\.confirmed/i)).toBeInTheDocument();
    });
  });
});
