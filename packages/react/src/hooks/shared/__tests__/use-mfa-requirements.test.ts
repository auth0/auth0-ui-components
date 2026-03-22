import { FACTOR_TYPE_RECOVERY_CODE, type MfaAuthenticator } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import { useMfaRequirements } from '@/hooks/shared/use-mfa-requirements';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { setupAllCommonMocks, createQueryClientWrapper, mockMfaRequiredError } from '@/tests/utils';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';

const mockError = {
  ...mockMfaRequiredError,
  mfa_requirements: { enroll: [{ type: 'otp' as const }] },
};

describe('useMfaRequirements', () => {
  let mockCoreClient: ReturnType<typeof createMockCoreClient>;
  let mockStepUpClient: ReturnType<
    ReturnType<typeof createMockCoreClient>['getMFAStepUpApiClient']
  >;
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = createMockCoreClient();
    mockStepUpClient = mockCoreClient.getMFAStepUpApiClient();
    mockHandleError = vi.fn();

    // Replace isProxyMode with a spy so individual tests can override it via vi.mocked()
    mockCoreClient.isProxyMode = vi.fn().mockReturnValue(false);
    // Inject getEnrollmentFactors (not present on the base mock) and re-assign mockStepUpClient
    // so test-level vi.mocked(mockStepUpClient.*) calls target the same object the hook uses
    vi.mocked(mockCoreClient.getMFAStepUpApiClient).mockReturnValue({
      ...mockStepUpClient,
      getEnrollmentFactors: vi.fn().mockResolvedValue([]),
    } as ReturnType<ReturnType<typeof createMockCoreClient>['getMFAStepUpApiClient']>);
    mockStepUpClient = mockCoreClient.getMFAStepUpApiClient();

    setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
      handleError: mockHandleError,
    });
  });

  it('returns empty factors, authenticators, and isEnrollMode=false initially', () => {
    const { wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useMfaRequirements(mockError), { wrapper });

    expect(result.current.factors).toEqual([]);
    expect(result.current.authenticators).toEqual([]);
    expect(result.current.isEnrollMode).toBe(false);
  });

  describe('normal mode', () => {
    it('returns enrollment factors and filters out recovery-code', async () => {
      const mockFactors = [
        { type: 'otp' as const },
        { type: 'sms' as const },
        { type: FACTOR_TYPE_RECOVERY_CODE as 'recovery-code' },
      ];
      vi.mocked(mockStepUpClient.getEnrollmentFactors!).mockResolvedValue(mockFactors);

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useMfaRequirements(mockError), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.factors).toEqual([{ type: 'otp' }, { type: 'sms' }]);
      expect(result.current.isEnrollMode).toBe(true);
    });

    it('returns only active authenticators when no enrollment factors exist', async () => {
      vi.mocked(mockStepUpClient.getEnrollmentFactors!).mockResolvedValue([]);
      vi.mocked(mockStepUpClient.getAuthenticators).mockResolvedValue([
        { id: 'auth-1', authenticatorType: 'oob', active: true } satisfies MfaAuthenticator,
        { id: 'auth-2', authenticatorType: 'otp', active: false } satisfies MfaAuthenticator,
      ]);

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useMfaRequirements(mockError), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.authenticators).toHaveLength(1);
      expect(result.current.authenticators[0]).toMatchObject({ id: 'auth-1' });
      expect(result.current.isEnrollMode).toBe(false);
    });
  });

  describe('proxy mode', () => {
    it('returns active authenticators from getAuthenticators', async () => {
      vi.mocked(mockCoreClient.isProxyMode).mockReturnValue(true);
      vi.mocked(mockStepUpClient.getAuthenticators).mockResolvedValue([
        { id: 'auth-1', authenticatorType: 'oob', active: true } satisfies MfaAuthenticator,
      ]);

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useMfaRequirements(mockError), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.authenticators).toHaveLength(1);
      expect(result.current.factors).toEqual([]);
      expect(result.current.isEnrollMode).toBe(false);
    });

    it('falls back to mfa_requirements.enroll when no active authenticators exist', async () => {
      vi.mocked(mockCoreClient.isProxyMode).mockReturnValue(true);
      vi.mocked(mockStepUpClient.getAuthenticators).mockResolvedValue([]);

      const errorWithRequirements = {
        ...mockError,
        mfa_requirements: {
          enroll: [
            { type: 'otp' as const },
            { type: FACTOR_TYPE_RECOVERY_CODE as 'recovery-code' },
          ],
        },
      };

      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useMfaRequirements(errorWithRequirements), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // recovery-code filtered out
      expect(result.current.factors).toEqual([{ type: 'otp' }]);
      expect(result.current.isEnrollMode).toBe(true);
    });
  });

  describe('error handling', () => {
    it('calls handleError when enrollment query fails', async () => {
      const error = new Error('enrollment fetch failed');
      vi.mocked(mockStepUpClient.getEnrollmentFactors!).mockRejectedValue(error);

      const { wrapper } = createQueryClientWrapper();
      renderHook(() => useMfaRequirements(mockError), { wrapper });

      await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
    });

    it('calls handleError when authenticators query fails', async () => {
      const error = new Error('authenticators fetch failed');
      vi.mocked(mockCoreClient.isProxyMode).mockReturnValue(true);
      vi.mocked(mockStepUpClient.getAuthenticators).mockRejectedValue(error);

      const { wrapper } = createQueryClientWrapper();
      renderHook(() => useMfaRequirements(mockError), { wrapper });

      await waitFor(() => expect(mockHandleError).toHaveBeenCalledWith(error));
    });
  });
});
