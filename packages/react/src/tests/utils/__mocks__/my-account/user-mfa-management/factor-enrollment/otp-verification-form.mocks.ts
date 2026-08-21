import { vi } from 'vitest';

import type { OTPVerificationFormProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

export const createMockOTPVerificationFormProps = (
  overrides: Partial<OTPVerificationFormProps> = {},
): OTPVerificationFormProps => ({
  factorType: 'email',
  contact: '',
  isConfirming: false,
  onConfirmOtp: vi.fn(),
  onBack: vi.fn(),
  styling: {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages: {},
  ...overrides,
});
