import { mfaQueryKeys } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useUserMFAService } from '@/hooks/my-account/use-user-mfa-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { mockCore, setupAllCommonMocks, createQueryClientWrapper } from '@/tests/utils';
import { createMockAvailableFactors } from '@/tests/utils/__mocks__/my-account/mfa/mfa.mocks';

const { initMockCoreClient } = mockCore();
let mockCoreClient: ReturnType<typeof initMockCoreClient>;

describe('useUserMFAService', () => {
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();

    ({ mockHandleError } = setupAllCommonMocks({
      useTranslatorModule,
      coreClient: mockCoreClient,
      useCoreClientModule,
      useErrorHandlerModule,
    }));
  });

  const renderService = (onlyActive = false) => {
    const { wrapper } = createQueryClientWrapper();
    return renderHook(() => useUserMFAService(onlyActive), { wrapper });
  };

  it('returns loading state initially', () => {
    const { result } = renderService();
    expect(result.current.factorsQuery.isLoading).toBe(true);
  });

  it('fetches and maps factors on success', async () => {
    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));
    expect(result.current.factorsQuery.data).toBeDefined();
    const apiClient = mockCoreClient.getMyAccountApiClient();
    expect(apiClient.factors.list).toHaveBeenCalledTimes(1);
    expect(apiClient.authenticationMethods.list).toHaveBeenCalledTimes(1);
  });

  it('calls handleError once when factorsQuery fails', async () => {
    const apiError = new Error('network error');
    mockCoreClient.getMyAccountApiClient().factors.list = vi.fn().mockRejectedValue(apiError);

    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isError).toBe(true));

    expect(mockHandleError).toHaveBeenCalledTimes(1);
    expect(mockHandleError).toHaveBeenCalledWith(
      apiError,
      expect.objectContaining({ fallbackMessage: expect.any(String) }),
    );
  });

  it('resets the error guard after recovery so a subsequent error fires handleError again', async () => {
    const apiClient = mockCoreClient.getMyAccountApiClient();
    const listFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockResolvedValueOnce(createMockAvailableFactors())
      .mockRejectedValueOnce(new Error('second failure'));
    apiClient.factors.list = listFn;

    const { result } = renderService();

    // first error fires handleError
    await waitFor(() => expect(result.current.factorsQuery.isError).toBe(true));
    expect(mockHandleError).toHaveBeenCalledTimes(1);

    // recovery clears the ref
    await result.current.factorsQuery.refetch();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    // second error should fire handleError again
    await result.current.factorsQuery.refetch();
    await waitFor(() => expect(result.current.factorsQuery.isError).toBe(true));
    expect(mockHandleError).toHaveBeenCalledTimes(2);
  });

  it('does not fetch when coreClient is null', () => {
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

    const { wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useUserMFAService(false), { wrapper });

    expect(result.current.factorsQuery.fetchStatus).toBe('idle');
  });

  it('calls authenticationMethods.create with mapped params on enroll', async () => {
    const apiClient = mockCoreClient.getMyAccountApiClient();
    vi.mocked(apiClient.authenticationMethods.create).mockResolvedValue({
      id: 'new_id',
      auth_session: 'sess',
    } as never);

    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    await result.current.enrollMutation.mutateAsync({ factorType: 'totp', options: {} });

    expect(apiClient.authenticationMethods.create).toHaveBeenCalled();
  });

  it('calls authenticationMethods.delete and invalidates query on success', async () => {
    const apiClient = mockCoreClient.getMyAccountApiClient();

    const { result, rerender } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    const initialCallCount = vi.mocked(apiClient.factors.list).mock.calls.length;
    await result.current.deleteMutation.mutateAsync('auth-id-123');

    expect(apiClient.authenticationMethods.delete).toHaveBeenCalledWith('auth-id-123');
    rerender();
    await waitFor(() => {
      expect(vi.mocked(apiClient.factors.list).mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('calls handleError on delete failure', async () => {
    const deleteError = new Error('delete failed');
    mockCoreClient.getMyAccountApiClient().authenticationMethods.delete = vi
      .fn()
      .mockRejectedValue(deleteError);

    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    await expect(result.current.deleteMutation.mutateAsync('auth-id-123')).rejects.toThrow();

    expect(mockHandleError).toHaveBeenCalledWith(
      deleteError,
      expect.objectContaining({ fallbackMessage: expect.any(String) }),
    );
  });

  it('calls authenticationMethods.verify with correct params on confirm', async () => {
    const apiClient = mockCoreClient.getMyAccountApiClient();

    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    await result.current.confirmEnrollmentMutation.mutateAsync({
      factorType: 'totp',
      authSession: 'sess-abc',
      authenticationMethodId: 'method-123',
      options: { userOtpCode: '123456' },
    });

    expect(apiClient.authenticationMethods.verify).toHaveBeenCalledWith(
      'method-123',
      expect.anything(),
    );
  });

  it('registers query under the onlyActive=true key when onlyActive is true', async () => {
    const { wrapper, queryClient } = createQueryClientWrapper();
    const { result } = renderHook(() => useUserMFAService(true), { wrapper });

    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    const cachedKeys = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.queryKey);
    expect(cachedKeys).toContainEqual(mfaQueryKeys.factors(true));
    expect(cachedKeys).not.toContainEqual(mfaQueryKeys.factors(false));
  });
});
