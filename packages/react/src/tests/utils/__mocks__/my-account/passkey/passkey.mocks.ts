import { vi } from 'vitest';

import type {
  Passkey,
  PasskeyActionModalProps,
  UserPasskeyMgmtViewProps,
} from '@/types/my-account/passkey/passkey-types';

export const createMockPasskeyActionModalProps = (
  overrides?: Partial<PasskeyActionModalProps>,
): PasskeyActionModalProps => ({
  open: true,
  onOpenChange: vi.fn(),
  isPending: false,
  onConfirm: vi.fn().mockResolvedValue(undefined),
  name: 'My Passkey',
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  ...overrides,
});

export const createMockPasskey = (overrides?: Partial<Passkey>): Passkey => ({
  id: 'pk-1',
  name: 'My Passkey',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockUserPasskeyMgmtViewProps = (
  overrides: Partial<UserPasskeyMgmtViewProps> = {},
): UserPasskeyMgmtViewProps => ({
  passkeys: [createMockPasskey()],
  isEnrolling: false,
  isRevoking: false,
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  hideHeader: false,
  disableAdd: false,
  disableRevoke: false,
  isRevokeModalOpen: false,
  currentPasskey: null,
  handleAddPasskey: vi.fn(),
  handleRevokePasskey: vi.fn(),
  handleConfirmRevoke: vi.fn().mockResolvedValue(undefined),
  setIsRevokeModalOpen: vi.fn(),
  ...overrides,
});
