import { FACTOR_TYPE_EMAIL } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { ENTER_CONTACT } from '@/lib/constants/my-account/user-mfa-management/user-mfa-constants';
import type { EnrollFactorModalProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

export const createMockEnrollFactorModalProps = (
  overrides: Partial<EnrollFactorModalProps> = {},
): EnrollFactorModalProps => ({
  open: true,
  onClose: vi.fn(),
  factorType: FACTOR_TYPE_EMAIL,
  enrollmentPhase: ENTER_CONTACT,
  contact: '',
  otpData: { barcodeUri: '', manualInputCode: '' },
  recoveryCode: '',
  isEnrolling: false,
  isConfirming: false,
  onSubmitContact: vi.fn().mockResolvedValue(true),
  onResendCode: vi.fn(),
  onConfirmOtp: vi.fn(),
  onContinueQRScan: vi.fn(),
  onConfirmRecoveryCode: vi.fn(),
  onStartQREnrollment: vi.fn(),
  schema: {},
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
