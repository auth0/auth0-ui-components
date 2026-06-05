import { passkeyQueryKeys, createPasskeyCredential } from '@auth0/universal-components-core';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useUserPasskeyService } from '@/hooks/my-account/shared/services/use-user-passkey-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  mockCore,
  setupMockUseCoreClient,
  setupMockUseTranslator,
  createQueryClientWrapper,
} from '@/tests/utils';

vi.mock('@auth0/universal-components-core', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    createPasskeyCredential: vi.fn(),
    parsePublicKeyCreationOptions: vi.fn((opts: unknown) => opts),
  };
});

const { initMockCoreClient } = mockCore();
let mockCoreClient: ReturnType<typeof initMockCoreClient>;
let apiClient: ReturnType<typeof mockCoreClient.getMyAccountApiClient>;

describe('useUserPasskeyService', () => {
  const renderService = () => {
    const { wrapper, queryClient } = createQueryClientWrapper();
    return { ...renderHook(() => useUserPasskeyService(), { wrapper }), queryClient };
  };

  const renderAndWait = async () => {
    const ctx = renderService();
    await waitFor(() => expect(ctx.result.current.passkeysQuery.isSuccess).toBe(true));
    return ctx;
  };

  const mockEnrollSetup = () => {
    vi.mocked(apiClient.authenticationMethods.create).mockResolvedValue({
      auth_session: 'session-abc',
      authn_params_public_key: { challenge: 'challenge' },
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    apiClient = mockCoreClient.getMyAccountApiClient();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    setupMockUseTranslator(useTranslatorModule);
  });

  describe('passkeysQuery', () => {
    it('returns loading state initially', () => {
      const { result } = renderService();
      expect(result.current.passkeysQuery.isLoading).toBe(true);
    });

    it('fetches and filters passkeys on success', async () => {
      vi.mocked(apiClient.authenticationMethods.list).mockResolvedValue({
        authentication_methods: [
          { id: 'pk-1', type: 'passkey', name: 'My Passkey', created_at: '2024-01-01' },
          { id: 'mfa-1', type: 'totp', created_at: '2024-01-01' },
        ],
      } as never);

      const { result } = await renderAndWait();

      expect(result.current.passkeysQuery.data).toEqual([
        expect.objectContaining({ id: 'pk-1', name: 'passkey_name', createdAt: '2024-01-01' }),
      ]);
    });

    it('does not fetch when coreClient is null', () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useUserPasskeyService(), { wrapper });

      expect(result.current.passkeysQuery.fetchStatus).toBe('idle');
    });

    it('registers query under the correct cache key', async () => {
      const { queryClient } = await renderAndWait();

      const cachedKeys = queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey);
      expect(cachedKeys).toContainEqual(passkeyQueryKeys.list());
    });
  });

  describe('enrollMutation', () => {
    it('calls create, createPasskeyCredential and verify in sequence', async () => {
      mockEnrollSetup();
      vi.mocked(createPasskeyCredential).mockResolvedValue({ id: 'cred-id' } as never);

      const { result } = await renderAndWait();
      await act(() => result.current.enrollMutation.mutateAsync());

      expect(apiClient.authenticationMethods.create).toHaveBeenCalledWith({ type: 'passkey' });
      expect(createPasskeyCredential).toHaveBeenCalled();
      expect(apiClient.authenticationMethods.verify).toHaveBeenCalledWith(
        'passkey|new',
        expect.objectContaining({ auth_session: 'session-abc' }),
      );
    });

    it('skips verify when createPasskeyCredential returns null (user cancelled)', async () => {
      mockEnrollSetup();
      vi.mocked(createPasskeyCredential).mockResolvedValue(null);

      const { result } = await renderAndWait();
      await act(() => result.current.enrollMutation.mutateAsync());

      expect(apiClient.authenticationMethods.verify).not.toHaveBeenCalled();
    });

    it('invalidates passkeys list on success', async () => {
      mockEnrollSetup();
      vi.mocked(createPasskeyCredential).mockResolvedValue({ id: 'cred-id' } as never);

      const { result, queryClient } = await renderAndWait();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await act(() => result.current.enrollMutation.mutateAsync());

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: passkeyQueryKeys.list() });
    });
  });

  describe('revokeMutation', () => {
    it('calls authenticationMethods.delete with correct id', async () => {
      const { result } = await renderAndWait();
      await act(() => result.current.revokeMutation.mutateAsync('pk-1'));

      expect(apiClient.authenticationMethods.delete).toHaveBeenCalledWith('pk-1');
    });

    it('invalidates passkeys list on success', async () => {
      const { result, queryClient } = await renderAndWait();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await act(() => result.current.revokeMutation.mutateAsync('pk-1'));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: passkeyQueryKeys.list() });
    });
  });
});
