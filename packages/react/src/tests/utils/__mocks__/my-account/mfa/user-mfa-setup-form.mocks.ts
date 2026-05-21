import { FACTOR_TYPE_EMAIL } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { ENTER_CONTACT } from '@/lib/constants/my-account/mfa/mfa-constants';
import type { UserMFASetupFormProps } from '@/types/my-account/mfa/mfa-types';

export const createMockUserMFASetupFormProps = (
  overrides: Partial<UserMFASetupFormProps> = {},
): UserMFASetupFormProps => ({
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
  onConfirmOtp: vi.fn(),
  onContinueQR: vi.fn(),
  onConfirmRecoveryCode: vi.fn(),
  onAdvanceToQR: vi.fn(),
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
