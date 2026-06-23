import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
} from '@auth0/universal-components-core';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as useUserMFAServiceModule from '@/hooks/my-account/shared/services/use-user-mfa-service';
import { useUserMFA } from '@/hooks/my-account/use-user-mfa';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  ENTER_CONTACT,
  ENTER_QR,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import {
  setupMockUseTranslator,
  setupMockUseErrorHandler,
  createQueryClientWrapper,
} from '@/tests/utils';
import type { UseUserMFAServiceReturn } from '@/types/my-account/mfa/mfa-types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn((_msg, opts) => {
      if (opts?.onAutoClose) setTimeout(() => opts.onAutoClose(), 0);
    }),
    error: vi.fn(),
  },
}));

type MockService = {
  factorsQuery: Pick<
    UseUserMFAServiceReturn['factorsQuery'],
    'data' | 'isLoading' | 'isSuccess' | 'isError' | 'error' | 'refetch'
  >;
  enrollMutation: Pick<UseUserMFAServiceReturn['enrollMutation'], 'mutateAsync' | 'isPending'>;
  deleteMutation: Pick<UseUserMFAServiceReturn['deleteMutation'], 'mutateAsync' | 'isPending'>;
  verifyMutation: Pick<UseUserMFAServiceReturn['verifyMutation'], 'mutateAsync' | 'isPending'>;
};

const makeEnrollResponse = (overrides: Record<string, string> = {}) => ({
  id: 'mid',
  auth_session: 'sess',
  barcode_uri: 'uri',
  manual_input_code: 'mc',
  recovery_code: 'rc',
  ...overrides,
});

const makeMockService = (overrides?: Partial<MockService>): MockService => ({
  factorsQuery: {
    data: {
      [FACTOR_TYPE_EMAIL]: [
        { id: 'e1', type: FACTOR_TYPE_EMAIL, enrolled: true, created_at: '2024' },
      ],
      [FACTOR_TYPE_TOTP]: [],
      [FACTOR_TYPE_PHONE]: [],
      [FACTOR_TYPE_PUSH_NOTIFICATION]: [],
      [FACTOR_TYPE_RECOVERY_CODE]: [],
    } as unknown as NonNullable<MockService['factorsQuery']['data']>,
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn().mockResolvedValue({}),
  },
  enrollMutation: {
    mutateAsync: vi.fn().mockResolvedValue(makeEnrollResponse()),
    isPending: false,
  },
  deleteMutation: {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  verifyMutation: {
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  },
  ...overrides,
});

let mockService: MockService;

const render = (opts?: Parameters<typeof useUserMFA>[0]) => {
  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useUserMFA(opts), { wrapper });
};

const mockEnrollWith = (overrides: Record<string, string>) =>
  vi
    .mocked(mockService.enrollMutation.mutateAsync)
    .mockResolvedValue(
      makeEnrollResponse(overrides) as unknown as Awaited<
        ReturnType<MockService['enrollMutation']['mutateAsync']>
      >,
    );

describe('useUserMFA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseTranslator(useTranslatorModule);
    setupMockUseErrorHandler(useErrorHandlerModule);
    mockService = makeMockService();
    vi.spyOn(useUserMFAServiceModule, 'useUserMFAService').mockReturnValue(
      mockService as unknown as UseUserMFAServiceReturn,
    );
  });

  it('returns correct initial state', () => {
    const { result } = render();
    expect(result.current.isEnrollDialogOpen).toBe(false);
    expect(result.current.enrollFactor).toBeNull();
    expect(result.current.enrollmentPhase).toBeNull();
    expect(result.current.isDeleteDialogOpen).toBe(false);
    expect(result.current.factorToDelete).toBeNull();
    expect(result.current.recoveryCode).toBe('');
  });

  it('reflects pending/loading flags from service', () => {
    vi.mocked(useUserMFAServiceModule.useUserMFAService).mockReturnValue({
      ...mockService,
      factorsQuery: { ...mockService.factorsQuery, isLoading: true },
      enrollMutation: { ...mockService.enrollMutation, isPending: true },
      deleteMutation: { ...mockService.deleteMutation, isPending: true },
      verifyMutation: { ...mockService.verifyMutation, isPending: true },
    } as unknown as UseUserMFAServiceReturn);
    const { result } = render();
    expect(result.current.isLoadingFactors).toBe(true);
    expect(result.current.isEnrolling).toBe(true);
    expect(result.current.isDeleting).toBe(true);
    expect(result.current.isConfirming).toBe(true);
  });

  it('calls onFetch once on first success', async () => {
    const onFetch = vi.fn();
    render({ onFetch });
    await waitFor(() => expect(onFetch).toHaveBeenCalledTimes(1));
  });

  it('filters out factors with visible: false', () => {
    const { result } = render({ factorConfig: { [FACTOR_TYPE_EMAIL]: { visible: false } } });
    expect(result.current.visibleFactorTypes).not.toContain(FACTOR_TYPE_EMAIL);
  });

  it('hasNoActiveFactors is false when a factor is enrolled', () => {
    const { result } = render();
    expect(result.current.hasNoActiveFactors).toBe(false);
  });

  it('hasNoActiveFactors is true when no factors are enrolled', () => {
    vi.mocked(useUserMFAServiceModule.useUserMFAService).mockReturnValue({
      ...mockService,
      factorsQuery: {
        ...mockService.factorsQuery,
        data: {
          [FACTOR_TYPE_EMAIL]: [
            { id: 'e1', type: FACTOR_TYPE_EMAIL, enrolled: false, created_at: null },
          ],
        } as unknown as NonNullable<MockService['factorsQuery']['data']>,
      },
    } as unknown as UseUserMFAServiceReturn);
    const { result } = render();
    expect(result.current.hasNoActiveFactors).toBe(true);
  });

  it('opens dialog and sets enrollFactor', async () => {
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    expect(result.current.isEnrollDialogOpen).toBe(true);
    expect(result.current.enrollFactor).toBe(FACTOR_TYPE_EMAIL);
  });

  it.each([
    [FACTOR_TYPE_EMAIL, ENTER_CONTACT],
    [FACTOR_TYPE_PHONE, ENTER_CONTACT],
    [FACTOR_TYPE_PUSH_NOTIFICATION, QR_PHASE_INSTALLATION],
  ] as const)('sets enrollmentPhase synchronously for %s', async (factor, expectedPhase) => {
    const { result } = render();
    await act(() => result.current.handleEnroll(factor));
    expect(result.current.enrollmentPhase).toBe(expectedPhase);
  });

  it('fetches enrollment data and sets ENTER_QR phase for totp', async () => {
    mockEnrollWith({ auth_session: 'qr-sess', barcode_uri: 'qr-uri', manual_input_code: 'mc' });
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    expect(result.current.enrollmentPhase).toBe(ENTER_QR);
    expect(result.current.otpData).toEqual({ barcodeUri: 'qr-uri', manualInputCode: 'mc' });
    expect(mockService.enrollMutation.mutateAsync).toHaveBeenCalledWith({
      factorType: FACTOR_TYPE_TOTP,
      options: {},
    });
  });

  it('fetches enrollment data and sets SHOW_RECOVERY_CODE phase for recovery code', async () => {
    mockEnrollWith({ auth_session: 'rc-sess', recovery_code: 'XY12-ZA34' });
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_RECOVERY_CODE));
    expect(result.current.enrollmentPhase).toBe(SHOW_RECOVERY_CODE);
    expect(result.current.recoveryCode).toBe('XY12-ZA34');
  });

  it('resets all enrollment state when dialog closes', async () => {
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    await act(() => result.current.handleCloseEnrollDialog());
    expect(result.current.isEnrollDialogOpen).toBe(false);
    expect(result.current.enrollmentPhase).toBeNull();
    expect(result.current.contact).toBe('');
    expect(result.current.otpData).toEqual({ barcodeUri: '', manualInputCode: '' });
    expect(result.current.recoveryCode).toBe('');
  });

  it('refetches when closing dialog for push notification after QR phase was reached', async () => {
    mockEnrollWith({ auth_session: 'push-sess', barcode_uri: 'push-uri' });
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_PUSH_NOTIFICATION));
    await act(() => result.current.handleEnterQRPhase());
    await act(() => result.current.handleCloseEnrollDialog());
    expect(mockService.factorsQuery.refetch).toHaveBeenCalled();
  });

  it('does not refetch when closing dialog for push notification at installation phase', async () => {
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_PUSH_NOTIFICATION));
    await act(() => result.current.handleCloseEnrollDialog());
    expect(mockService.factorsQuery.refetch).not.toHaveBeenCalled();
  });

  it('does not refetch when closing dialog for non-push factor', async () => {
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    await act(() => result.current.handleCloseEnrollDialog());
    expect(mockService.factorsQuery.refetch).not.toHaveBeenCalled();
  });

  it('opens delete confirmation dialog when no onBeforeAction', async () => {
    const { result } = render();
    await act(() => result.current.handleDeleteFactor('fid', FACTOR_TYPE_EMAIL));
    expect(result.current.isDeleteDialogOpen).toBe(true);
    expect(result.current.factorToDelete).toEqual({ id: 'fid', type: FACTOR_TYPE_EMAIL });
  });

  it.each([
    ['readOnly', { readOnly: true }],
    ['disableDelete', { disableDelete: true }],
  ] as const)('does nothing when %s', async (_, opts) => {
    const { result } = render(opts);
    await act(() => result.current.handleDeleteFactor('fid', FACTOR_TYPE_EMAIL));
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  it('skips delete when onBeforeAction returns false', async () => {
    const { result } = render({ onBeforeAction: vi.fn().mockResolvedValue(false) });
    await act(() => result.current.handleDeleteFactor('fid', FACTOR_TYPE_EMAIL));
    expect(mockService.deleteMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('proceeds with delete when onBeforeAction returns true', async () => {
    const { result } = render({ onBeforeAction: vi.fn().mockResolvedValue(true) });
    await act(() => result.current.handleDeleteFactor('fid', FACTOR_TYPE_EMAIL));
    expect(mockService.deleteMutation.mutateAsync).toHaveBeenCalledWith('fid');
  });

  it('closes dialog and calls onDelete on successful delete', async () => {
    const onDelete = vi.fn();
    const { result } = render({ onDelete, onBeforeAction: vi.fn().mockResolvedValue(true) });
    await act(() => result.current.handleDeleteFactor('fid', FACTOR_TYPE_EMAIL));
    await waitFor(() => expect(result.current.isDeleteDialogOpen).toBe(false));
    expect(result.current.factorToDelete).toBeNull();
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });

  it('calls onErrorAction and closes dialog on delete failure', async () => {
    const deleteError = new Error('delete failed');
    vi.mocked(mockService.deleteMutation.mutateAsync).mockRejectedValue(deleteError);
    const onErrorAction = vi.fn();
    const { result } = render({ onErrorAction, onBeforeAction: vi.fn().mockResolvedValue(true) });
    await act(() => result.current.handleDeleteFactor('fid', FACTOR_TYPE_EMAIL));
    expect(onErrorAction).toHaveBeenCalledWith(deleteError, 'delete');
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  it.each([
    [FACTOR_TYPE_EMAIL, { email: 'test@example.com' }, 'test@example.com'],
    [FACTOR_TYPE_PHONE, { phone_number: '+1234567890' }, '+1234567890'],
  ] as const)('sets contact field for %s', async (factor, options, expectedContact) => {
    const { result } = render();
    await act(() => result.current.handleEnroll(factor));
    await act(() => result.current.handleSendCode(options));
    expect(result.current.contact).toBe(expectedContact);
  });

  it('calls confirm mutation with OTP code and completes enrollment', async () => {
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    await act(() => result.current.handleConfirmOtp('123456'));
    expect(mockService.verifyMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ options: { userOtpCode: '123456' } }),
    );
    await waitFor(() => expect(result.current.isEnrollDialogOpen).toBe(false));
  });

  it('skips verify mutation when enrollFactor is not push notification', async () => {
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    await act(() => result.current.handleConfirmPush());
    expect(mockService.verifyMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('confirms and completes for push notification', async () => {
    mockEnrollWith({ auth_session: 'push-sess', barcode_uri: 'push-uri' });
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_PUSH_NOTIFICATION));
    await act(() => result.current.handleEnterQRPhase());
    await act(() => result.current.handleConfirmPush());
    expect(mockService.verifyMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION }),
    );
    await waitFor(() => expect(result.current.isEnrollDialogOpen).toBe(false));
  });

  it('confirms and completes recovery code enrollment', async () => {
    mockEnrollWith({ auth_session: 'rc-sess', recovery_code: 'ABCD-1234' });
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_RECOVERY_CODE));
    await act(() => result.current.handleConfirmRecoveryCode());
    expect(mockService.verifyMutation.mutateAsync).toHaveBeenCalledWith({
      factorType: FACTOR_TYPE_RECOVERY_CODE,
      authSession: 'rc-sess',
      authenticationMethodId: 'mid',
      options: {},
    });
    await waitFor(() => expect(result.current.isEnrollDialogOpen).toBe(false));
  });

  it('handleEnterQRPhase fetches QR data and sets ENTER_QR phase', async () => {
    mockEnrollWith({ auth_session: 'push-sess', barcode_uri: 'push-uri', manual_input_code: 'mc' });
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_PUSH_NOTIFICATION));
    await act(() => result.current.handleEnterQRPhase());
    expect(result.current.enrollmentPhase).toBe(ENTER_QR);
    expect(result.current.otpData).toEqual({ barcodeUri: 'push-uri', manualInputCode: 'mc' });
  });

  it('closes dialog and clears enrollFactor when enroll fetch fails', async () => {
    vi.mocked(mockService.enrollMutation.mutateAsync).mockRejectedValue(new Error('enroll failed'));
    const { result } = render();
    await act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    expect(result.current.isEnrollDialogOpen).toBe(false);
    expect(result.current.enrollFactor).toBeNull();
  });
});
