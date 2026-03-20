import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import { useMfaStepUp } from '@/hooks/shared/use-mfa-step-up';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { setupAllCommonMocks, mockMfaRequiredError } from '@/tests/utils';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';

const mockError = mockMfaRequiredError;

describe('useMfaStepUp', () => {
  let mockCoreClient: ReturnType<typeof createMockCoreClient>;
  let mockStepUpClient: ReturnType<
    ReturnType<typeof createMockCoreClient>['getMFAStepUpApiClient']
  >;
  let mockOnComplete: ReturnType<typeof vi.fn>;
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = createMockCoreClient();
    mockStepUpClient = mockCoreClient.getMFAStepUpApiClient();
    mockOnComplete = vi.fn();
    mockHandleError = vi.fn();

    setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
      handleError: mockHandleError,
    });
  });

  describe('enroll', () => {
    it('calls stepUpClient.enroll with provided params and returns the result', async () => {
      const enrollResponse = {
        authenticatorType: 'otp' as const,
        barcodeUri: 'otpauth://totp/test',
        secret: 'SECRET',
      };
      vi.mocked(mockStepUpClient.enroll).mockResolvedValue(enrollResponse);

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      let response: unknown;
      await act(async () => {
        response = await result.current.enroll({
          mfaToken: mockError.mfa_token,
          factorType: 'otp',
        });
      });

      expect(mockStepUpClient.enroll).toHaveBeenCalledWith({
        mfaToken: mockError.mfa_token,
        factorType: 'otp',
      });
      expect(response).toEqual(enrollResponse);
    });

    it('sets isLoading to true while enrolling, then false after', async () => {
      let resolveEnroll!: (v?: unknown) => void;
      vi.mocked(mockStepUpClient.enroll).mockImplementation(
        () =>
          new Promise((res) => {
            resolveEnroll = res;
          }) as never,
      );

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      act(() => {
        result.current.enroll({ mfaToken: mockError.mfa_token, factorType: 'otp' });
      });
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveEnroll();
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('calls handleError and returns undefined when enroll throws', async () => {
      const error = new Error('enroll failed');
      vi.mocked(mockStepUpClient.enroll).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      let response: unknown;
      await act(async () => {
        response = await result.current.enroll({
          mfaToken: mockError.mfa_token,
          factorType: 'otp',
        });
      });

      expect(mockHandleError).toHaveBeenCalledWith(error);
      expect(response).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('challenge', () => {
    it('calls stepUpClient.challenge with mfaToken and authenticatorId', async () => {
      const challengeResponse = { challengeType: 'oob' as const, oobCode: 'oob-code-123' };
      vi.mocked(mockStepUpClient.challenge).mockResolvedValue(challengeResponse);

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      let response: unknown;
      await act(async () => {
        response = await result.current.challenge({ id: 'auth-id-1' });
      });

      expect(mockStepUpClient.challenge).toHaveBeenCalledWith({
        mfaToken: mockError.mfa_token,
        challengeType: 'oob',
        authenticatorId: 'auth-id-1',
      });
      expect(response).toEqual(challengeResponse);
    });

    it('calls handleError and returns undefined when challenge throws', async () => {
      const error = new Error('challenge failed');
      vi.mocked(mockStepUpClient.challenge).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      let response: unknown;
      await act(async () => {
        response = await result.current.challenge({ id: 'auth-id-1' });
      });

      expect(mockHandleError).toHaveBeenCalledWith(error);
      expect(response).toBeUndefined();
    });
  });

  describe('verify', () => {
    it('calls stepUpClient.verify and then onComplete on success', async () => {
      vi.mocked(mockStepUpClient.verify).mockResolvedValue({
        id_token: '',
        access_token: '',
        expires_in: 0,
      });

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      await act(async () => {
        await result.current.verify({ mfaToken: mockError.mfa_token, otp: '123456' });
      });

      expect(mockStepUpClient.verify).toHaveBeenCalledWith({
        mfaToken: mockError.mfa_token,
        otp: '123456',
      });
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('sets isLoading during verify and resets after', async () => {
      let resolveVerify!: (v?: unknown) => void;
      vi.mocked(mockStepUpClient.verify).mockImplementation(
        () =>
          new Promise((res) => {
            resolveVerify = res;
          }) as never,
      );

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      act(() => {
        result.current.verify({ mfaToken: mockError.mfa_token, otp: '123456' });
      });
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveVerify();
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('calls handleError and does not call onComplete when verify throws', async () => {
      const error = new Error('verify failed');
      vi.mocked(mockStepUpClient.verify).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useMfaStepUp({ error: mockError, onComplete: mockOnComplete }),
      );

      await act(async () => {
        await result.current.verify({ mfaToken: mockError.mfa_token, otp: '000000' });
      });

      expect(mockHandleError).toHaveBeenCalledWith(error);
      expect(mockOnComplete).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
