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

  it('should return null for null/undefined errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current(null)).toBeNull();
    expect(result.current(undefined)).toBeNull();
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should return null for MFA errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const mfaError = {
      body: {
        error: 'mfa_required',
      },
    };

    expect(result.current(mfaError)).toBeNull();
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should return null for 500+ errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const serverError = {
      body: {
        status: 500,
      },
    };

    expect(result.current(serverError)).toBeNull();
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

    const errorMessage = result.current(apiError);

    expect(errorMessage).toBe('Invalid request parameters');
    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Invalid request parameters',
    });
  });

  it('should handle Error instances', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Something went wrong');

    const errorMessage = result.current(error);

    expect(errorMessage).toBe('Something went wrong');
    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Something went wrong',
    });
  });

  it('should handle string errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = 'Network error occurred';

    const errorMessage = result.current(error);

    expect(errorMessage).toBe('Network error occurred');
    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Network error occurred',
    });
  });

  it('should use fallback message for unknown error types', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = { unknown: 'object' };

    const errorMessage = result.current(error);

    expect(errorMessage).toBe('error.generic');
    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'error.generic',
    });
  });

  it('should not show toast when showToast option is false', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');

    const errorMessage = result.current(error, { showToast: false });

    expect(errorMessage).toBe('Test error');
    expect(mockedShowToast).not.toHaveBeenCalled();
  });

  it('should use custom error message getter', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Original message');
    const getErrorMessage = vi.fn(() => 'Custom error message');

    const errorMessage = result.current(error, { getErrorMessage });

    expect(getErrorMessage).toHaveBeenCalledWith(error);
    expect(errorMessage).toBe('Custom error message');
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

    const errorMessage = result.current(apiError);

    expect(errorMessage).toBe('error.generic');
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

    const errorMessage = result.current(notFoundError);

    expect(errorMessage).toBe('Resource not found');
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

    const errorMessage = result.current(unauthorizedError);

    expect(errorMessage).toBe('Unauthorized access');
    expect(mockedShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Unauthorized access',
    });
  });
});
