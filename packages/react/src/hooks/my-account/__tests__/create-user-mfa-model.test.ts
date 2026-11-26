import { describe, it, expect, vi } from 'vitest';

import { createUserMFAModel } from '@/hooks/my-account/use-user-mfa';
import {
  createMockAuthenticator,
  createMockUserMFAManagementViewProps,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import type { UseUserMFAReturn } from '@/types/my-account/user-mfa-management/user-mfa-management-types';

const FLAGS = {
  readOnly: false,
  disableEnroll: false,
  disableDelete: false,
  showActiveOnly: false,
  factorConfig: {},
};

const enrolledTotp = createMockAuthenticator({ id: 'totp_1', type: 'totp', enrolled: true });
const pendingTotp = createMockAuthenticator({ id: 'totp_2', type: 'totp', enrolled: false });

const createState = (overrides: Partial<UseUserMFAReturn> = {}): UseUserMFAReturn => ({
  factorsByType: {
    ...createMockUserMFAManagementViewProps().factorsByType,
    totp: [enrolledTotp, pendingTotp],
    phone: [],
  },
  isLoadingFactors: false,
  isEnrolling: false,
  isDeleting: false,
  isConfirming: false,
  isEnrollDialogOpen: false,
  enrollFactor: null,
  enrollmentPhase: null,
  isDeleteDialogOpen: false,
  factorToDelete: null,
  visibleFactorTypes: ['totp', 'phone'],
  hasNoActiveFactors: false,
  contact: '',
  otpData: { barcodeUri: '', manualInputCode: '' },
  recoveryCode: '',
  handleCancelDelete: vi.fn(),
  handleConfirmDelete: vi.fn().mockResolvedValue(undefined),
  handleEnroll: vi.fn().mockResolvedValue(undefined),
  handleCloseEnrollDialog: vi.fn().mockResolvedValue(undefined),
  handleDeleteFactor: vi.fn().mockResolvedValue(undefined),
  handleSendCode: vi.fn().mockResolvedValue(true),
  handleConfirmOtp: vi.fn().mockResolvedValue(undefined),
  handleConfirmPush: vi.fn().mockResolvedValue(undefined),
  handleConfirmRecoveryCode: vi.fn().mockResolvedValue(undefined),
  handleEnterQRPhase: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('createUserMFAModel', () => {
  it('should keep the state and expose the flags', () => {
    const state = createState();
    const model = createUserMFAModel(state, { ...FLAGS, readOnly: true, showActiveOnly: true });

    expect(model.visibleFactorTypes).toBe(state.visibleFactorTypes);
    expect(model.handleEnroll).toBe(state.handleEnroll);
    expect(model.readOnly).toBe(true);
    expect(model.showActiveOnly).toBe(true);
    expect(model.disableEnroll).toBe(false);
  });

  describe('getFactorProps', () => {
    it('should list only enrolled authenticators of the factor type', () => {
      const model = createUserMFAModel(createState(), FLAGS);

      expect(model.getFactorProps('totp').activeFactors).toEqual([enrolledTotp]);
      expect(model.getFactorProps('totp').hasActiveFactors).toBe(true);
      expect(model.getFactorProps('phone').activeFactors).toEqual([]);
      expect(model.getFactorProps('phone').hasActiveFactors).toBe(false);
    });

    describe('when the factor type is enabled', () => {
      it('should offer an enroll action that can be triggered', () => {
        const { enrollAction } = createUserMFAModel(createState(), FLAGS).getFactorProps('totp');

        expect(enrollAction).toMatchObject({ hidden: false, disabled: false, pending: false });
      });
    });

    describe('when readOnly is set', () => {
      it('should hide the enroll action', () => {
        const model = createUserMFAModel(createState(), { ...FLAGS, readOnly: true });

        expect(model.getFactorProps('totp').enrollAction.hidden).toBe(true);
      });
    });

    describe('when disableEnroll is set', () => {
      it('should disable the enroll action of every factor', () => {
        const model = createUserMFAModel(createState(), { ...FLAGS, disableEnroll: true });

        expect(model.getFactorProps('totp').enrollAction.disabled).toBe(true);
        expect(model.getFactorProps('phone').enrollAction.disabled).toBe(true);
      });
    });

    describe('when a factor is configured with enabled: false', () => {
      it('should disable only that factor', () => {
        const model = createUserMFAModel(createState(), {
          ...FLAGS,
          factorConfig: { phone: { enabled: false } },
        });

        expect(model.getFactorProps('phone')).toMatchObject({
          isEnabled: false,
          enrollAction: { disabled: true },
        });
        expect(model.getFactorProps('totp')).toMatchObject({
          isEnabled: true,
          enrollAction: { disabled: false },
        });
      });
    });

    describe('when enrollment is running', () => {
      it('should mark only the enrolling factor as pending', () => {
        const model = createUserMFAModel(
          createState({ isEnrolling: true, enrollFactor: 'totp' }),
          FLAGS,
        );

        expect(model.getFactorProps('totp').enrollAction.pending).toBe(true);
        expect(model.getFactorProps('phone').enrollAction.pending).toBe(false);
      });
    });

    describe('enrollAction.onClick', () => {
      it('should start enrollment of the factor type', () => {
        const state = createState();
        createUserMFAModel(state, FLAGS).getFactorProps('phone').enrollAction.onClick();

        expect(state.handleEnroll).toHaveBeenCalledWith('phone');
      });

      it.each([
        ['hidden', { ...FLAGS, readOnly: true }, createState()],
        ['disabled', { ...FLAGS, disableEnroll: true }, createState()],
        ['pending', FLAGS, createState({ isEnrolling: true, enrollFactor: 'totp' })],
      ])('should do nothing while %s', (_, flags, state) => {
        createUserMFAModel(state, flags).getFactorProps('totp').enrollAction.onClick();

        expect(state.handleEnroll).not.toHaveBeenCalled();
      });
    });
  });

  describe('getEnrolledFactorProps', () => {
    it('should return the authenticator with a delete action that can be triggered', () => {
      const model = createUserMFAModel(createState(), FLAGS);
      const props = model.getEnrolledFactorProps(enrolledTotp, 'totp');

      expect(props.factor).toBe(enrolledTotp);
      expect(props.factorType).toBe('totp');
      expect(props.deleteAction).toMatchObject({ hidden: false, disabled: false, pending: false });
    });

    describe('when readOnly is set', () => {
      it('should hide the delete action', () => {
        const model = createUserMFAModel(createState(), { ...FLAGS, readOnly: true });

        expect(model.getEnrolledFactorProps(enrolledTotp, 'totp').deleteAction.hidden).toBe(true);
      });
    });

    describe('when delete is not allowed', () => {
      it.each([
        ['disableDelete is set', { ...FLAGS, disableDelete: true }, createState()],
        ['a deletion is running', FLAGS, createState({ isDeleting: true })],
        [
          'the factor type is configured with enabled: false',
          { ...FLAGS, factorConfig: { totp: { enabled: false } } },
          createState(),
        ],
      ])('should disable the delete action when %s', (_, flags, state) => {
        const model = createUserMFAModel(state, flags);

        expect(model.getEnrolledFactorProps(enrolledTotp, 'totp').deleteAction.disabled).toBe(true);
      });
    });

    describe('when a deletion is running', () => {
      it('should mark only the authenticator being deleted as pending', () => {
        const other = createMockAuthenticator({ id: 'totp_3', type: 'totp', enrolled: true });
        const model = createUserMFAModel(
          createState({ isDeleting: true, factorToDelete: { id: 'totp_1', type: 'totp' } }),
          FLAGS,
        );

        expect(model.getEnrolledFactorProps(enrolledTotp, 'totp').deleteAction.pending).toBe(true);
        expect(model.getEnrolledFactorProps(other, 'totp').deleteAction.pending).toBe(false);
      });
    });

    describe('deleteAction.onClick', () => {
      it('should ask to delete the authenticator, which opens the confirmation', () => {
        const state = createState();
        createUserMFAModel(state, FLAGS)
          .getEnrolledFactorProps(enrolledTotp, 'totp')
          .deleteAction.onClick();

        expect(state.handleDeleteFactor).toHaveBeenCalledWith('totp_1', 'totp');
        expect(state.handleConfirmDelete).not.toHaveBeenCalled();
      });

      it.each([
        ['hidden', { ...FLAGS, readOnly: true }, createState()],
        ['disabled', { ...FLAGS, disableDelete: true }, createState()],
        [
          'pending',
          FLAGS,
          createState({ isDeleting: true, factorToDelete: { id: 'totp_1', type: 'totp' } }),
        ],
      ])('should do nothing while %s', (_, flags, state) => {
        createUserMFAModel(state, flags)
          .getEnrolledFactorProps(enrolledTotp, 'totp')
          .deleteAction.onClick();

        expect(state.handleDeleteFactor).not.toHaveBeenCalled();
      });
    });
  });
});
