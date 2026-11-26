import { describe, it, expect, vi } from 'vitest';

import { createUserPasskeyModel } from '@/hooks/my-account/use-user-passkey';
import { makePasskey } from '@/tests/utils/__mocks__/my-account/user-passkey-management/use-user-passkey.mocks';
import type { UseUserPasskeyReturn } from '@/types/my-account/user-passkey-management/user-passkey-management-types';

const first = makePasskey({ id: 'pk-1', name: 'One' });
const second = makePasskey({ id: 'pk-2', name: 'Two' });

const createState = (overrides: Partial<UseUserPasskeyReturn> = {}): UseUserPasskeyReturn => ({
  passkeys: [first, second],
  isLoading: false,
  isEnrolling: false,
  isRevoking: false,
  disableAdd: false,
  disableRevoke: false,
  readOnly: false,
  isRevokeModalOpen: false,
  currentPasskey: null,
  setIsRevokeModalOpen: vi.fn(),
  handleAddPasskey: vi.fn().mockResolvedValue(undefined),
  handleRevokePasskey: vi.fn(),
  handleConfirmRevoke: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('createUserPasskeyModel', () => {
  it('should keep the state', () => {
    const state = createState();
    const model = createUserPasskeyModel(state);

    expect(model.passkeys).toBe(state.passkeys);
    expect(model.handleConfirmRevoke).toBe(state.handleConfirmRevoke);
  });

  describe('hasPasskeys', () => {
    it('should be true when there are passkeys', () => {
      expect(createUserPasskeyModel(createState()).hasPasskeys).toBe(true);
    });

    it('should be false when there are none', () => {
      expect(createUserPasskeyModel(createState({ passkeys: [] })).hasPasskeys).toBe(false);
    });
  });

  describe('getAddActionProps', () => {
    it('should offer an add action that can be triggered', () => {
      const action = createUserPasskeyModel(createState()).getAddActionProps();

      expect(action).toMatchObject({ hidden: false, disabled: false, pending: false });
    });

    it('should hide the action when adding is disabled', () => {
      const model = createUserPasskeyModel(createState({ disableAdd: true }));

      expect(model.getAddActionProps().hidden).toBe(true);
    });

    it('should disable the action while loading', () => {
      const model = createUserPasskeyModel(createState({ isLoading: true }));

      expect(model.getAddActionProps().disabled).toBe(true);
    });

    it('should mark the action as pending while enrolling', () => {
      const model = createUserPasskeyModel(createState({ isEnrolling: true }));

      expect(model.getAddActionProps().pending).toBe(true);
    });

    describe('onClick', () => {
      it('should start adding a passkey', () => {
        const state = createState();
        createUserPasskeyModel(state).getAddActionProps().onClick();

        expect(state.handleAddPasskey).toHaveBeenCalledTimes(1);
      });

      it.each([
        ['hidden', { disableAdd: true }],
        ['disabled', { isLoading: true }],
        ['pending', { isEnrolling: true }],
      ])('should do nothing while %s', (_, overrides) => {
        const state = createState(overrides);
        createUserPasskeyModel(state).getAddActionProps().onClick();

        expect(state.handleAddPasskey).not.toHaveBeenCalled();
      });
    });
  });

  describe('getItemProps', () => {
    it('should return the passkey with a revoke action that can be triggered', () => {
      const props = createUserPasskeyModel(createState()).getItemProps(first);

      expect(props.passkey).toBe(first);
      expect(props.revokeAction).toMatchObject({ hidden: false, disabled: false, pending: false });
    });

    it('should hide the revoke action when revoking is disabled', () => {
      const model = createUserPasskeyModel(createState({ disableRevoke: true }));

      expect(model.getItemProps(first).revokeAction.hidden).toBe(true);
    });

    it('should mark only the passkey being revoked as pending', () => {
      const model = createUserPasskeyModel(
        createState({ isRevoking: true, currentPasskey: first }),
      );

      expect(model.getItemProps(first).revokeAction.pending).toBe(true);
      expect(model.getItemProps(second).revokeAction.pending).toBe(false);
    });

    describe('revokeAction.onClick', () => {
      it('should ask to revoke the passkey, which opens the confirmation', () => {
        const state = createState();
        createUserPasskeyModel(state).getItemProps(second).revokeAction.onClick();

        expect(state.handleRevokePasskey).toHaveBeenCalledWith(second);
        expect(state.handleConfirmRevoke).not.toHaveBeenCalled();
      });

      it.each([
        ['hidden', { disableRevoke: true }],
        ['pending', { isRevoking: true, currentPasskey: first }],
      ])('should do nothing while %s', (_, overrides) => {
        const state = createState(overrides);
        createUserPasskeyModel(state).getItemProps(first).revokeAction.onClick();

        expect(state.handleRevokePasskey).not.toHaveBeenCalled();
      });
    });
  });
});
