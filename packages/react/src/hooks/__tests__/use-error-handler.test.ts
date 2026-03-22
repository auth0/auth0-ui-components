import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';

const { mockIsNotifiableError, mockResolveErrorMessage, mockGetStatusCode, mockHasApiErrorBody } =
  vi.hoisted(() => ({
    mockIsNotifiableError: vi.fn(),
    mockResolveErrorMessage: vi.fn(),
    mockGetStatusCode: vi.fn(),
    mockHasApiErrorBody: vi.fn(),
  }));

vi.mock('@auth0/universal-components-core', () => ({
  isNotifiableError: mockIsNotifiableError,
  resolveErrorMessage: mockResolveErrorMessage,
  getStatusCode: mockGetStatusCode,
  hasApiErrorBody: mockHasApiErrorBody,
  ERROR_CODES: { INSUFFICIENT_SCOPE: 'A0E-403-0002' },
}));

vi.mock('@/components/auth0/shared/toast');

describe('useErrorHandler', () => {
  const mockT = createMockI18nService().translator('common');

  let handleError: ReturnType<typeof useErrorHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: mockT,
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: undefined,
    });
    mockResolveErrorMessage.mockReturnValue('resolved error message');
    const { result } = renderHook(() => useErrorHandler());
    handleError = result.current;
  });

  describe('when error is not notifiable', () => {
    it('should return early without showing a toast', () => {
      mockIsNotifiableError.mockReturnValue(false);

      handleError(new Error('non-notifiable'));

      expect(showToast).not.toHaveBeenCalled();
    });
  });

  describe('when error is notifiable', () => {
    beforeEach(() => {
      mockIsNotifiableError.mockReturnValue(true);
    });

    it.each([
      [400, 'error.bad_request'],
      [401, 'error.missing_token'],
      [404, 'error.not_found'],
      [429, 'error.rate_limit'],
    ])('%i error should show %s toast', (status, expectedMessage) => {
      mockGetStatusCode.mockReturnValue(status);

      handleError(new Error('error'));

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: expectedMessage,
      });
    });

    describe('403 error', () => {
      beforeEach(() => {
        mockGetStatusCode.mockReturnValue(403);
      });

      it.each([
        [
          'insufficient scope body type',
          true,
          { body: { type: 'A0E-403-0002' } },
          'error.insufficient_scope',
        ],
        ['unrecognised body type', true, { body: { type: 'some-other-code' } }, 'error.forbidden'],
        ['no body', false, new Error('forbidden'), 'error.forbidden'],
      ] as const)('should show correct toast for %s', (_label, hasBody, error, expectedMessage) => {
        mockHasApiErrorBody.mockReturnValue(hasBody);

        handleError(error);

        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: expectedMessage,
        });
      });
    });

    describe('when status code is not mapped', () => {
      beforeEach(() => {
        mockGetStatusCode.mockReturnValue(500);
        mockResolveErrorMessage.mockReturnValue('resolved error');
      });

      it('should use resolveErrorMessage with provided fallbackMessage', () => {
        const error = new Error('server error');

        handleError(error, { fallbackMessage: 'custom fallback' });

        expect(mockResolveErrorMessage).toHaveBeenCalledWith(error, 'custom fallback');
        expect(showToast).toHaveBeenCalledWith({ type: 'error', message: 'resolved error' });
      });

      it('should fall back to generic error message when no fallbackMessage is provided', () => {
        const error = new Error('server error');

        handleError(error);

        expect(mockResolveErrorMessage).toHaveBeenCalledWith(error, 'error.generic');
        expect(showToast).toHaveBeenCalledWith({ type: 'error', message: 'resolved error' });
      });
    });

    describe('when status code is absent', () => {
      it('should fall back to generic error message', () => {
        mockGetStatusCode.mockReturnValue(undefined);
        const error = new Error('unknown error');

        handleError(error);

        expect(mockResolveErrorMessage).toHaveBeenCalledWith(error, 'error.generic');
      });
    });
  });
});
