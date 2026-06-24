import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';

const mockHandleError = vi.fn();

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => mockHandleError,
}));

describe('useQueryErrorToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call handleError when query has an error', () => {
    const error = new Error('Test error');
    renderHook(() => useQueryErrorToast({ isError: true, error }, 'Something went wrong'));

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'Something went wrong',
    });
  });

  it('should not call handleError when query has no error', () => {
    renderHook(() => useQueryErrorToast({ isError: false, error: null }, 'Something went wrong'));

    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it('should only show error toast once per error occurrence', () => {
    const error = new Error('Test error');
    const query = { isError: true, error };

    const { rerender } = renderHook(() => useQueryErrorToast(query, 'Something went wrong'));

    expect(mockHandleError).toHaveBeenCalledTimes(1);

    rerender();

    expect(mockHandleError).toHaveBeenCalledTimes(1);
  });

  it('should show error again after query recovers and fails again', () => {
    const error = new Error('Test error');
    let query: { isError: boolean; error: Error | null } = { isError: true, error };

    const { rerender } = renderHook(() => useQueryErrorToast(query, 'Something went wrong'));

    expect(mockHandleError).toHaveBeenCalledTimes(1);

    // Query recovers
    query = { isError: false, error: null };
    rerender();

    // Query fails again
    query = { isError: true, error };
    rerender();

    expect(mockHandleError).toHaveBeenCalledTimes(2);
  });
});
