import { FACTOR_TYPE_EMAIL } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { UserMFASetupFormProps } from '@/types/my-account/mfa/mfa-types';

export const createMockUserMFASetupFormProps = (
  overrides: Partial<UserMFASetupFormProps> = {},
): UserMFASetupFormProps => ({
  open: true,
  onClose: vi.fn(),
  factorType: FACTOR_TYPE_EMAIL,
  enrollMfa: vi.fn().mockResolvedValue({
    data: {
      barcode_uri: 'test-barcode-uri',
      oob_code: 'test-oob-code',
    },
  }),
  confirmEnrollment: vi.fn().mockResolvedValue({ success: true }),
  onSuccess: vi.fn(),
  onError: vi.fn(),
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
