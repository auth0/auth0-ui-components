import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockI18nService } from '@/tests/utils';

vi.mock('@/components/auth0/shared/toast');

describe('useErrorHandler', () => {
  const mockT = createMockI18nService().translator('common');
  const mockedShowToast = vi.mocked(showToast);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: mockT,
      changeLanguage: vi.fn(),
      currentLanguage: 'en-US',
      fallbackLanguage: 'en-US',
    });
  });

  it('should not show toast for null/undefined errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current(null);
    result.current(undefined);
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should not show toast for MFA errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const mfaError = {
      body: {
        error: 'mfa_required',
      },
    };

    result.current(mfaError);
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should not show toast for 500+ errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const serverError = {
      body: {
        status: 500,
      },
    };

    result.current(serverError);
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should handle API errors with body.detail', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = {
      body: {
        status: 400,
        detail: 'Invalid request parameters',
      },
    };

    result.current(apiError);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Invalid request parameters',
    });
  });

  it('should handle Error instances', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Something went wrong');

    result.current(error);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Something went wrong',
    });
  });

  it('should handle string errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = 'Network error occurred';

    result.current(error);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Network error occurred',
    });
  });

  it('should use fallback message for unknown error types', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = { unknown: 'object' };

    result.current(error);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'error.generic',
    });
  });

  it('should not show toast when showToast option is false', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');

    result.current(error, { showToast: false });

    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should use custom error message getter', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Original message');
    const getErrorMessage = vi.fn(() => 'Custom error message');

    result.current(error, { getErrorMessage });

    expect(getErrorMessage).toHaveBeenCalledWith(error);
    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Custom error message',
    });
  });

  it('should handle API errors without detail', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = {
      body: {
        status: 400,
      },
    };

    result.current(apiError);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'error.generic',
    });
  });

  it('should handle 404 errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const notFoundError = {
      body: {
        status: 404,
        detail: 'Resource not found',
      },
    };

    result.current(notFoundError);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Resource not found',
    });
  });

  it('should handle 401 errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const unauthorizedError = {
      body: {
        status: 401,
        detail: 'Unauthorized access',
      },
    };

    result.current(unauthorizedError);

    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Unauthorized access',
    });
  });
});
