import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useProviderFormMode } from '@/hooks/my-organization/use-provider-form-mode';

describe('useProviderFormMode', () => {
  it('should return showCopyButtons as false when mode is "create"', () => {
    const { result } = renderHook(() => useProviderFormMode('create'));

    expect(result.current.showCopyButtons).toBe(false);
  });

  it('should return showCopyButtons as true when mode is "edit"', () => {
    const { result } = renderHook(() => useProviderFormMode('edit'));

    expect(result.current.showCopyButtons).toBe(true);
  });

  it('should default to "create" mode when no mode is provided', () => {
    const { result } = renderHook(() => useProviderFormMode());

    expect(result.current.showCopyButtons).toBe(false);
  });

  it('should memoize the result based on mode', () => {
    const { result, rerender } = renderHook(({ mode }) => useProviderFormMode(mode), {
      initialProps: { mode: 'create' as const },
    });

    const firstResult = result.current;

    // Rerender with same mode
    rerender({ mode: 'create' as const });
    expect(result.current).toBe(firstResult);
  });

  it('should return new memoized value when mode changes', () => {
    const { result, rerender } = renderHook(
      ({ mode }: { mode: 'create' | 'edit' }) => useProviderFormMode(mode),
      {
        initialProps: { mode: 'create' },
      },
    );

    const firstResult = result.current;
    expect(firstResult.showCopyButtons).toBe(false);

    // Change mode to 'edit'
    rerender({ mode: 'edit' });
    expect(result.current).not.toBe(firstResult);
    expect(result.current.showCopyButtons).toBe(true);
  });

  it('should return consistent results for the same mode', () => {
    const { result: result1 } = renderHook(() => useProviderFormMode('create'));
    const { result: result2 } = renderHook(() => useProviderFormMode('create'));

    expect(result1.current.showCopyButtons).toBe(result2.current.showCopyButtons);
  });

  it('should return different results for different modes', () => {
    const { result: createResult } = renderHook(() => useProviderFormMode('create'));
    const { result: editResult } = renderHook(() => useProviderFormMode('edit'));

    expect(createResult.current.showCopyButtons).toBe(false);
    expect(editResult.current.showCopyButtons).toBe(true);
    expect(createResult.current.showCopyButtons).not.toBe(editResult.current.showCopyButtons);
  });
});
