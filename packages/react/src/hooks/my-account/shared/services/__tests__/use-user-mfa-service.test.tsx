import { mfaQueryKeys } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useUserMFAService } from '@/hooks/my-account/shared/services/use-user-mfa-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';
import { setupMockUseCoreClient } from '@/tests/utils/test-utilities';

const { initMockCoreClient } = mockCore();
let mockCoreClient: ReturnType<typeof initMockCoreClient>;

describe('useUserMFAService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
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

  it('calls authenticationMethods.delete on success', async () => {
    const apiClient = mockCoreClient.getMyAccountApiClient();

    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    await result.current.deleteMutation.mutateAsync('auth-id-123');

    expect(apiClient.authenticationMethods.delete).toHaveBeenCalledWith('auth-id-123');
  });

  it('calls authenticationMethods.verify with correct params on confirm', async () => {
    const apiClient = mockCoreClient.getMyAccountApiClient();

    const { result } = renderService();
    await waitFor(() => expect(result.current.factorsQuery.isSuccess).toBe(true));

    await result.current.verifyMutation.mutateAsync({
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
