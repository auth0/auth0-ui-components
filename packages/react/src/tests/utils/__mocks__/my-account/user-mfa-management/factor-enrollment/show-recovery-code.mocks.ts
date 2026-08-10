import { vi } from 'vitest';

import type { ShowRecoveryCodeProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

export const createMockShowRecoveryCodeProps = (
  overrides: Partial<ShowRecoveryCodeProps> = {},
): ShowRecoveryCodeProps => ({
  recoveryCode: 'ABCD-EFGH-IJKL-MNOP',
  isLoading: false,
  onConfirmRecoveryCode: vi.fn(),
  onClose: vi.fn(),
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  customMessages: {},
  ...overrides,
});
