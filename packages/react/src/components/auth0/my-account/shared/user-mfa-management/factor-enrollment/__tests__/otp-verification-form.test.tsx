import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { OTPVerificationForm } from '@/components/auth0/my-account/shared/user-mfa-management/factor-enrollment/otp-verification-form';
import { createMockOTPVerificationFormProps } from '@/tests/utils/__mocks__/my-account/user-mfa-management/factor-enrollment/otp-verification-form.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('OTPVerificationForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render OTP input field', async () => {
      renderWithProviders(<OTPVerificationForm {...createMockOTPVerificationFormProps()} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should display contact info', async () => {
      renderWithProviders(
        <OTPVerificationForm
          {...createMockOTPVerificationFormProps({
            factorType: 'email',
            contact: 'test@example.com',
          })}
        />,
      );

      // When contact info is provided, should display it but masked
      expect(await screen.findByText('enrollment.verify.email.description')).toBeInTheDocument();
    });

    it('should display verification instructions', async () => {
      renderWithProviders(<OTPVerificationForm {...createMockOTPVerificationFormProps()} />);

      // When form is rendered, should show instructions
      const instructions = screen.queryAllByText(/enrollment\.verify|code|verification|enter/i);
      expect(instructions.length).toBeGreaterThan(0);
    });
  });

  it('should call onCancel callback when back button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnBack = vi.fn();

    renderWithProviders(
      <OTPVerificationForm {...createMockOTPVerificationFormProps({ onBack: mockOnBack })} />,
    );

    const backButton = await screen.findByRole('button', { name: /back/i });

    // When back button is clicked, should trigger callback
    await user.click(backButton);

    // When onback is called, should be invoked exactly once
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  describe('buttons', () => {
    it('should display verify button', async () => {
      renderWithProviders(<OTPVerificationForm {...createMockOTPVerificationFormProps()} />);

      // When form is rendered, should display verify button
      expect(
        await screen.findByRole('button', { name: /verify|confirm|submit/i }),
      ).toBeInTheDocument();
    });

    it('should display cancel button', async () => {
      renderWithProviders(<OTPVerificationForm {...createMockOTPVerificationFormProps()} />);

      // When form is rendered, should display cancel button
      expect(await screen.findByRole('button', { name: /cancel|back/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible OTP input', async () => {
      renderWithProviders(<OTPVerificationForm {...createMockOTPVerificationFormProps()} />);

      // When form is rendered, input should be accessible
      const input = screen.getAllByRole('textbox');
      expect(input.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', async () => {
      renderWithProviders(<OTPVerificationForm {...createMockOTPVerificationFormProps()} />);

      // When form is rendered, all buttons should be accessible
      expect(await screen.findByRole('button', { name: /verify/i })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });
});
