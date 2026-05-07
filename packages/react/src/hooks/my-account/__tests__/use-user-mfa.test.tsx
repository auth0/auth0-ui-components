import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
} from '@auth0/universal-components-core';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useUserMFA } from '@/hooks/my-account/use-user-mfa';
import * as useUserMFAServiceModule from '@/hooks/my-account/use-user-mfa-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  ENTER_CONTACT,
  ENTER_QR,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import { mockCore, setupAllCommonMocks, createQueryClientWrapper } from '@/tests/utils';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn((_msg, opts) => {
      if (opts?.onAutoClose) setTimeout(() => opts.onAutoClose(), 0);
    }),
    error: vi.fn(),
  },
}));

// ===== Helpers =====

type MockService = ReturnType<typeof useUserMFAServiceModule.useUserMFAService>;

const makeEnrollResponse = (overrides: Record<string, string> = {}) => ({
  id: 'mid',
  auth_session: 'sess',
  barcode_uri: 'uri',
  manual_input_code: 'mc',
  recovery_code: 'rc',
  ...overrides,
});

const makeMockService = (overrides?: Partial<MockService>): MockService =>
  ({
    factorsQuery: {
      data: {
        [FACTOR_TYPE_EMAIL]: [
          { id: 'e1', type: FACTOR_TYPE_EMAIL, enrolled: true, created_at: '2024' },
        ],
        [FACTOR_TYPE_TOTP]: [],
        [FACTOR_TYPE_PHONE]: [],
        [FACTOR_TYPE_PUSH_NOTIFICATION]: [],
        [FACTOR_TYPE_RECOVERY_CODE]: [],
      },
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
    confirmEnrollmentMutation: {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    },
    ...overrides,
  }) as unknown as MockService;

// ===== Setup =====

const { initMockCoreClient } = mockCore();
let mockService: MockService;

const render = (opts?: Parameters<typeof useUserMFA>[0]) => {
  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useUserMFA(opts), { wrapper });
};

const mockEnrollWith = (overrides: Record<string, string>) =>
  vi
    .mocked(mockService.enrollMutation.mutateAsync)
    .mockResolvedValue(makeEnrollResponse(overrides) as never);

describe('useUserMFA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockCoreClient = initMockCoreClient();
    setupAllCommonMocks({
      useTranslatorModule,
      coreClient: mockCoreClient,
      useCoreClientModule,
      useErrorHandlerModule,
    });
    mockService = makeMockService();
    vi.spyOn(useUserMFAServiceModule, 'useUserMFAService').mockReturnValue(mockService);
  });

  // --- initial state ---

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
    const pending = { isPending: true };
    vi.spyOn(useUserMFAServiceModule, 'useUserMFAService').mockReturnValue(
      makeMockService({
        factorsQuery: { ...makeMockService().factorsQuery, isLoading: true } as never,
        enrollMutation: pending as never,
        deleteMutation: pending as never,
        confirmEnrollmentMutation: pending as never,
      }),
    );
    const { result } = render();
    expect(result.current.isLoadingFactors).toBe(true);
    expect(result.current.isEnrolling).toBe(true);
    expect(result.current.isDeleting).toBe(true);
    expect(result.current.isConfirming).toBe(true);
  });

  // --- onFetch ---

  it('calls onFetch once on first success', async () => {
    const onFetch = vi.fn();
    const { result } = render({ onFetch });
    await waitFor(() => expect(result.current.isLoadingFactors).toBe(false));
    expect(onFetch).toHaveBeenCalledTimes(1);
  });

  // --- visibleFactorTypes / hasNoActiveFactors ---

  it('filters out factors with visible: false', () => {
    const { result } = render({ factorConfig: { [FACTOR_TYPE_EMAIL]: { visible: false } } });
    expect(result.current.visibleFactorTypes).not.toContain(FACTOR_TYPE_EMAIL);
  });

  it('hasNoActiveFactors is false when a factor is enrolled', () => {
    const { result } = render();
    expect(result.current.hasNoActiveFactors).toBe(false);
  });

  it('hasNoActiveFactors is true when no factors are enrolled', () => {
    vi.spyOn(useUserMFAServiceModule, 'useUserMFAService').mockReturnValue(
      makeMockService({
        factorsQuery: {
          ...makeMockService().factorsQuery,
          data: {
            [FACTOR_TYPE_EMAIL]: [
              { id: 'e1', type: FACTOR_TYPE_EMAIL, enrolled: false, created_at: null },
            ],
          },
        } as never,
      }),
    );
    const { result } = render();
    expect(result.current.hasNoActiveFactors).toBe(true);
  });

  // --- handleEnroll / dialog state ---

  it('opens dialog and sets enrollFactor', () => {
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    expect(result.current.isEnrollDialogOpen).toBe(true);
    expect(result.current.enrollFactor).toBe(FACTOR_TYPE_EMAIL);
  });

  it.each([
    [FACTOR_TYPE_EMAIL, ENTER_CONTACT],
    [FACTOR_TYPE_PHONE, ENTER_CONTACT],
    [FACTOR_TYPE_TOTP, ENTER_QR],
    [FACTOR_TYPE_PUSH_NOTIFICATION, QR_PHASE_INSTALLATION],
    [FACTOR_TYPE_RECOVERY_CODE, SHOW_RECOVERY_CODE],
  ] as const)('sets initial enrollmentPhase to %s for %s', async (factor, expectedPhase) => {
    vi.mocked(mockService.enrollMutation.mutateAsync).mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = render();
    act(() => result.current.handleEnroll(factor));
    await waitFor(() => expect(result.current.enrollmentPhase).toBe(expectedPhase));
  });

  it('resets all enrollment state when dialog closes', async () => {
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    act(() => result.current.handleCloseEnrollDialog());
    await waitFor(() => {
      expect(result.current.isEnrollDialogOpen).toBe(false);
      expect(result.current.enrollmentPhase).toBeNull();
      expect(result.current.contact).toBe('');
      expect(result.current.otpData).toEqual({ barcodeUri: '', manualInputCode: '' });
      expect(result.current.recoveryCode).toBe('');
    });
  });

  // --- handleCloseEnrollDialog ---

  it('refetches when closing dialog for push notification', () => {
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_PUSH_NOTIFICATION));
    act(() => result.current.handleCloseEnrollDialog());
    expect(mockService.factorsQuery.refetch).toHaveBeenCalled();
  });

  it('does not refetch when closing dialog for non-push factor', () => {
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    act(() => result.current.handleCloseEnrollDialog());
    expect(mockService.factorsQuery.refetch).not.toHaveBeenCalled();
  });

  // --- handleDeleteFactor ---

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

  // --- handleConfirmDelete ---

  it('closes dialog and calls onDelete on successful delete', async () => {
    const onDelete = vi.fn();
    const { result } = render({ onDelete });
    await act(() => result.current.handleConfirmDelete('fid'));
    await waitFor(() => expect(result.current.isDeleteDialogOpen).toBe(false));
    expect(result.current.factorToDelete).toBeNull();
    await new Promise((r) => setTimeout(r, 10));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onErrorAction and closes dialog on delete failure', async () => {
    const deleteError = new Error('delete failed');
    vi.mocked(mockService.deleteMutation.mutateAsync).mockRejectedValue(deleteError);
    const onErrorAction = vi.fn();
    const { result } = render({ onErrorAction });
    await act(() => result.current.handleConfirmDelete('fid'));
    expect(onErrorAction).toHaveBeenCalledWith(deleteError, 'delete');
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  // --- handleSubmitContact ---

  it.each([
    [FACTOR_TYPE_EMAIL, { email: 'test@example.com' }, 'test@example.com'],
    [FACTOR_TYPE_PHONE, { phone_number: '+1234567890' }, '+1234567890'],
  ] as const)('sets contact field for %s', async (factor, options, expectedContact) => {
    const { result } = render();
    act(() => result.current.handleEnroll(factor));
    await act(() => result.current.handleSubmitContact(options));
    expect(result.current.contact).toBe(expectedContact);
  });

  // --- handleConfirmOtp ---

  it('calls confirm mutation with OTP code and completes enrollment', async () => {
    const onEnroll = vi.fn();
    const { result } = render({ onEnroll });
    act(() => result.current.handleEnroll(FACTOR_TYPE_EMAIL));
    await act(() => result.current.handleConfirmOtp('123456'));
    expect(mockService.confirmEnrollmentMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ options: { userOtpCode: '123456' } }),
    );
    await waitFor(() => expect(result.current.isEnrollDialogOpen).toBe(false));
  });

  // --- handleContinueQR ---

  it('does nothing when enrollFactor is not push notification', async () => {
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    await act(() => result.current.handleContinueQR());
    expect(mockService.confirmEnrollmentMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('confirms and completes for push notification', async () => {
    mockEnrollWith({ auth_session: 'push-sess', barcode_uri: 'push-uri' });
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_PUSH_NOTIFICATION));
    act(() => result.current.handleAdvanceToQR());
    await waitFor(() => expect(result.current.otpData.barcodeUri).toBe('push-uri'));
    await act(() => result.current.handleContinueQR());
    expect(mockService.confirmEnrollmentMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ factorType: FACTOR_TYPE_PUSH_NOTIFICATION }),
    );
    await waitFor(() => expect(result.current.isEnrollDialogOpen).toBe(false));
  });

  // --- handleConfirmRecoveryCode ---

  it('confirms and completes recovery code enrollment', async () => {
    mockEnrollWith({ auth_session: 'rc-sess', recovery_code: 'ABCD-1234' });
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_RECOVERY_CODE));
    await waitFor(() => expect(result.current.recoveryCode).toBe('ABCD-1234'));
    await act(() => result.current.handleConfirmRecoveryCode());
    expect(mockService.confirmEnrollmentMutation.mutateAsync).toHaveBeenCalled();
    await waitFor(() => expect(result.current.isEnrollDialogOpen).toBe(false));
  });

  // --- handleAdvanceToQR ---

  it('sets enrollmentPhase to ENTER_QR', () => {
    const { result } = render();
    act(() => result.current.handleAdvanceToQR());
    expect(result.current.enrollmentPhase).toBe(ENTER_QR);
  });

  // --- auto-fetch effect ---

  it('auto-fetches QR data when entering ENTER_QR phase', async () => {
    mockEnrollWith({ auth_session: 'qr-sess', barcode_uri: 'qr-uri', manual_input_code: 'mc' });
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    await waitFor(() => expect(result.current.otpData.barcodeUri).toBe('qr-uri'));
    expect(mockService.enrollMutation.mutateAsync).toHaveBeenCalledWith({
      factorType: FACTOR_TYPE_TOTP,
      options: {},
    });
  });

  it('skips auto-fetch when barcodeUri is already populated', async () => {
    mockEnrollWith({ barcode_uri: 'existing-uri' });
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    await waitFor(() => expect(result.current.otpData.barcodeUri).toBe('existing-uri'));
    const callCount = vi.mocked(mockService.enrollMutation.mutateAsync).mock.calls.length;
    act(() => result.current.handleAdvanceToQR());
    expect(vi.mocked(mockService.enrollMutation.mutateAsync).mock.calls.length).toBe(callCount);
  });

  it('auto-fetches recovery code when entering SHOW_RECOVERY_CODE phase', async () => {
    mockEnrollWith({ auth_session: 'rc-sess', recovery_code: 'XY12-ZA34' });
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_RECOVERY_CODE));
    await waitFor(() => expect(result.current.recoveryCode).toBe('XY12-ZA34'));
    expect(mockService.enrollMutation.mutateAsync).toHaveBeenCalledWith({
      factorType: FACTOR_TYPE_RECOVERY_CODE,
      options: {},
    });
  });

  it('closes dialog and clears enrollFactor when auto-fetch fails', async () => {
    vi.mocked(mockService.enrollMutation.mutateAsync).mockRejectedValue(new Error('enroll failed'));
    const { result } = render();
    act(() => result.current.handleEnroll(FACTOR_TYPE_TOTP));
    await waitFor(() => {
      expect(result.current.isEnrollDialogOpen).toBe(false);
      expect(result.current.enrollFactor).toBeNull();
    });
  });
});
