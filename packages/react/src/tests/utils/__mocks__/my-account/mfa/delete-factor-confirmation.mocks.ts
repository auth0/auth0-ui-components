import { vi } from 'vitest';

import type { DeleteFactorConfirmationProps } from '@/types';

export const createMockDeleteFactorConfirmationProps = (
  overrides: Partial<DeleteFactorConfirmationProps> = {},
): DeleteFactorConfirmationProps => ({
  open: true,
  onOpenChange: vi.fn(),
  factorToDelete: {
    id: 'test-factor-id',
    type: 'totp',
  },
  isDeletingFactor: false,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
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
