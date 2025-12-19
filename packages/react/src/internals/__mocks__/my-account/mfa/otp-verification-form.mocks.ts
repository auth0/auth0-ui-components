import { vi } from 'vitest';

import type { OTPVerificationFormProps } from '../../../../types/my-account/mfa/mfa-types';

export const createMockOTPVerificationFormProps = (
  overrides: Partial<OTPVerificationFormProps> = {},
): OTPVerificationFormProps => ({
  factorType: 'email',
  confirmEnrollment: vi.fn().mockResolvedValue(null),
  onError: vi.fn(),
  onSuccess: vi.fn(),
  onClose: vi.fn(),
  contact: '',
  authSession: 'test-auth-session',
  authenticationMethodId: 'test-auth-method-id',
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
