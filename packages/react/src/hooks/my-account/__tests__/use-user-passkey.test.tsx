import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as useUserPasskeyServiceModule from '@/hooks/my-account/shared/services/use-user-passkey-service';
import { useUserPasskey } from '@/hooks/my-account/use-user-passkey';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  mockToast,
  setupMockUseTranslator,
  setupMockUseErrorHandler,
  createQueryClientWrapper,
} from '@/tests/utils';
import {
  makePasskey,
  makeMockService,
  type MockService,
} from '@/tests/utils/__mocks__/my-account/passkey/use-user-passkey.mocks';

const { mockedShowToast } = mockToast();

let mockService: MockService;
let mockHandleError: ReturnType<typeof vi.fn>;

const render = (opts?: Parameters<typeof useUserPasskey>[0]) => {
  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useUserPasskey(opts ?? {}), { wrapper });
};

describe('useUserPasskey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseTranslator(useTranslatorModule);
    mockHandleError = setupMockUseErrorHandler(useErrorHandlerModule);
    mockService = makeMockService();
    vi.spyOn(useUserPasskeyServiceModule, 'useUserPasskeyService').mockReturnValue(
      mockService as unknown as ReturnType<
        typeof useUserPasskeyServiceModule.useUserPasskeyService
      >,
    );
  });

  it('returns correct initial state', () => {
    const { result } = render();
    expect(result.current.isRevokeModalOpen).toBe(false);
    expect(result.current.currentPasskey).toBeNull();
    expect(result.current.passkeys).toEqual([makePasskey()]);
  });

  it('reflects pending/loading flags from service', () => {
    vi.spyOn(useUserPasskeyServiceModule, 'useUserPasskeyService').mockReturnValue({
      ...mockService,
      passkeysQuery: { ...mockService.passkeysQuery, isLoading: true },
      enrollMutation: { ...mockService.enrollMutation, isPending: true },
      revokeMutation: { ...mockService.revokeMutation, isPending: true },
    } as unknown as ReturnType<typeof useUserPasskeyServiceModule.useUserPasskeyService>);
    const { result } = render();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isEnrolling).toBe(true);
    expect(result.current.isRevoking).toBe(true);
  });

  it('calls onFetch when query succeeds', async () => {
    const onFetch = vi.fn();
    render({ onFetch });
    await waitFor(() => expect(onFetch).toHaveBeenCalledTimes(1));
  });

  it('readOnly is false while loading', () => {
    vi.spyOn(useUserPasskeyServiceModule, 'useUserPasskeyService').mockReturnValue({
      ...mockService,
      passkeysQuery: { ...mockService.passkeysQuery, isLoading: true },
    } as unknown as ReturnType<typeof useUserPasskeyServiceModule.useUserPasskeyService>);
    const { result } = render({
      addAction: { disabled: true },
      revokeAction: { disabled: true },
    });
    expect(result.current.readOnly).toBe(false);
  });

  it('readOnly is true when all actions disabled and not loading', () => {
    const { result } = render({
      addAction: { disabled: true },
      revokeAction: { disabled: true },
    });
    expect(result.current.readOnly).toBe(true);
  });

  describe('handleAddPasskey', () => {
    it('does nothing when disableAdd is true', async () => {
      const { result } = render({ addAction: { disabled: true } });
      await act(() => result.current.handleAddPasskey());
      expect(mockService.enrollMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('does nothing when onBefore returns false', async () => {
      const { result } = render({ addAction: { onBefore: vi.fn().mockReturnValue(false) } });
      await act(() => result.current.handleAddPasskey());
      expect(mockService.enrollMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('does not call onAfter or show toast when enroll is cancelled (returns false)', async () => {
      vi.mocked(mockService.enrollMutation.mutateAsync).mockResolvedValue(false as never);
      const onAfter = vi.fn();
      const { result } = render({ addAction: { onAfter } });
      await act(() => result.current.handleAddPasskey());
      expect(onAfter).not.toHaveBeenCalled();
      expect(mockedShowToast).not.toHaveBeenCalled();
    });

    it('calls onAfter and shows toast on success', async () => {
      const onAfter = vi.fn();
      const { result } = render({ addAction: { onAfter } });
      await act(() => result.current.handleAddPasskey());
      expect(onAfter).toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalled();
    });

    it('calls handleError and onErrorAction on failure', async () => {
      const enrollError = new Error('enroll failed');
      vi.mocked(mockService.enrollMutation.mutateAsync).mockRejectedValue(enrollError);
      const onErrorAction = vi.fn();
      const { result } = render({ onErrorAction });
      await act(() => result.current.handleAddPasskey());
      expect(mockHandleError).toHaveBeenCalledWith(enrollError);
      expect(onErrorAction).toHaveBeenCalledWith(enrollError, 'add');
    });
  });

  describe('handleRevokePasskey', () => {
    it.each([
      ['disabled', { revokeAction: { disabled: true } }],
      ['onBefore returns false', { revokeAction: { onBefore: vi.fn().mockReturnValue(false) } }],
    ] as const)('does nothing when %s', (_, opts) => {
      const { result } = render(opts);
      act(() => result.current.handleRevokePasskey(makePasskey()));
      expect(result.current.isRevokeModalOpen).toBe(false);
    });

    it('opens revoke modal and sets currentPasskey', async () => {
      const passkey = makePasskey();
      const { result } = render();
      act(() => result.current.handleRevokePasskey(passkey));
      expect(result.current.isRevokeModalOpen).toBe(true);
      expect(result.current.currentPasskey).toEqual(passkey);
    });
  });

  describe('handleConfirmRevoke', () => {
    it('calls revokeMutation with currentPasskey id', async () => {
      const passkey = makePasskey();
      const { result } = render();
      act(() => result.current.handleRevokePasskey(passkey));
      await act(() => result.current.handleConfirmRevoke());
      expect(mockService.revokeMutation.mutateAsync).toHaveBeenCalledWith(passkey.id);
    });

    it('calls onAfter and shows toast on success', async () => {
      const onAfter = vi.fn();
      const passkey = makePasskey();
      const { result } = render({ revokeAction: { onAfter } });
      act(() => result.current.handleRevokePasskey(passkey));
      await act(() => result.current.handleConfirmRevoke());
      expect(onAfter).toHaveBeenCalledWith(passkey);
      expect(mockedShowToast).toHaveBeenCalled();
    });

    it('closes modal after success', async () => {
      const { result } = render();
      act(() => result.current.handleRevokePasskey(makePasskey()));
      await act(() => result.current.handleConfirmRevoke());
      expect(result.current.isRevokeModalOpen).toBe(false);
      expect(result.current.currentPasskey).toBeNull();
    });

    it('calls handleError and onErrorAction on failure and closes modal', async () => {
      const revokeError = new Error('revoke failed');
      vi.mocked(mockService.revokeMutation.mutateAsync).mockRejectedValue(revokeError);
      const onErrorAction = vi.fn();
      const { result } = render({ onErrorAction });
      act(() => result.current.handleRevokePasskey(makePasskey()));
      await act(() => result.current.handleConfirmRevoke());
      expect(mockHandleError).toHaveBeenCalledWith(revokeError);
      expect(onErrorAction).toHaveBeenCalledWith(revokeError, 'revoke');
      expect(result.current.isRevokeModalOpen).toBe(false);
    });
  });

  describe('modal close handlers', () => {
    it('closes revoke modal on false', () => {
      const { result } = render();
      act(() => result.current.handleRevokePasskey(makePasskey()));
      act(() => result.current.setIsRevokeModalOpen(false));
      expect(result.current.isRevokeModalOpen).toBe(false);
    });
  });
});
