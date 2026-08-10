import { FACTOR_TYPE_EMAIL } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { ContactInputFormProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

export const createMockContactInputFormProps = (
  overrides: Partial<ContactInputFormProps> = {},
): ContactInputFormProps => ({
  factorType: FACTOR_TYPE_EMAIL,
  contact: '',
  phase: 'enterContact',
  isEnrolling: false,
  isConfirming: false,
  onSubmitContact: vi.fn().mockResolvedValue(true),
  onResendCode: vi.fn(),
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
