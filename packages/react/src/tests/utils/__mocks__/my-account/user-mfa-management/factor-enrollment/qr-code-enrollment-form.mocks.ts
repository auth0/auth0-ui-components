import { FACTOR_TYPE_TOTP } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { QRCodeEnrollmentFormProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

export const createMockQRCodeEnrollmentFormProps = (
  overrides: Partial<QRCodeEnrollmentFormProps> = {},
): QRCodeEnrollmentFormProps => ({
  factorType: FACTOR_TYPE_TOTP,
  otpData: { barcodeUri: 'otpauth://totp/test?secret=ABCDEF', manualInputCode: 'ABCDEF123456' },
  isEnrolling: false,
  isConfirming: false,
  phase: 'scan',
  onContinueQRScan: vi.fn(),
  onConfirmOtp: vi.fn(),
  onClose: vi.fn(),
  onPhaseChange: vi.fn(),
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  customMessages: {},
  ...overrides,
});
