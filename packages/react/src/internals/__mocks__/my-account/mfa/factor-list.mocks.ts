import { FACTOR_TYPE_EMAIL } from '@auth0/web-ui-components-core';
import { vi } from 'vitest';

import type { FactorsListProps } from '../../../../types/my-account/mfa/mfa-types';

export const createMockFactorsListProps = (
  overrides: Partial<FactorsListProps> = {},
): FactorsListProps => ({
  factors: [
    {
      id: 'factor-1',
      name: 'test@example.com',
      type: 'email',
      enrolled: false,
      created_at: null,
    },
    {
      id: 'factor-2',
      name: '+1234567890',
      type: 'phone',
      enrolled: false,
      created_at: null,
    },
  ],
  factorType: FACTOR_TYPE_EMAIL,
  readOnly: false,
  isEnabledFactor: true,
  onDeleteFactor: vi.fn(),
  isDeletingFactor: false,
  disableDelete: false,
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
