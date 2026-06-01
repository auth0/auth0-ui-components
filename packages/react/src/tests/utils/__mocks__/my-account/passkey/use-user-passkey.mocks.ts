import { vi } from 'vitest';

import type {
  Passkey,
  UseUserPasskeyServiceResult,
} from '@/types/my-account/passkey/passkey-types';

export const makePasskey = (overrides?: Partial<Passkey>): Passkey => ({
  id: 'pk-1',
  name: 'My Passkey',
  createdAt: '2024-01-01',
  ...overrides,
});

export type MockService = {
  passkeysQuery: Pick<
    UseUserPasskeyServiceResult['passkeysQuery'],
    'data' | 'isLoading' | 'isSuccess' | 'isError' | 'error'
  >;
  enrollMutation: Pick<UseUserPasskeyServiceResult['enrollMutation'], 'mutateAsync' | 'isPending'>;
  revokeMutation: Pick<UseUserPasskeyServiceResult['revokeMutation'], 'mutateAsync' | 'isPending'>;
  renameMutation: Pick<UseUserPasskeyServiceResult['renameMutation'], 'mutateAsync' | 'isPending'>;
};

export const makeMockService = (overrides?: Partial<MockService>): MockService => ({
  passkeysQuery: {
    data: [makePasskey()],
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
  },
  enrollMutation: { mutateAsync: vi.fn().mockResolvedValue(true), isPending: false },
  revokeMutation: { mutateAsync: vi.fn().mockResolvedValue(undefined), isPending: false },
  renameMutation: { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false },
  ...overrides,
});
