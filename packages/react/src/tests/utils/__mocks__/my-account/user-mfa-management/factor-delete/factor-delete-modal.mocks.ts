import { vi } from 'vitest';

import type { FactorDeleteModalProps } from '@/types';

export const createMockFactorDeleteModalProps = (
  overrides: Partial<FactorDeleteModalProps> = {},
): FactorDeleteModalProps => ({
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
