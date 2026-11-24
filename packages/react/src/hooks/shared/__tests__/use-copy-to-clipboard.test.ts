import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCopyToClipboard } from '@/hooks/shared/use-copy-to-clipboard';

describe('useCopyToClipboard', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.status).toBe('idle');
  });

  it('copies, reports copied, then resets after the delay', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetAfterMs: 500 }));

    let ok = false;
    await act(async () => {
      ok = await result.current.copy('value');
    });

    expect(writeText).toHaveBeenCalledWith('value');
    expect(ok).toBe(true);
    expect(result.current.status).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.status).toBe('idle');
  });

  it('reports error when the clipboard write fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useCopyToClipboard());

    let ok = true;
    await act(async () => {
      ok = await result.current.copy('value');
    });

    expect(ok).toBe(false);
    expect(result.current.status).toBe('error');
  });

  it('restarts the reset timer on repeated copies', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetAfterMs: 1000 }));

    await act(async () => {
      await result.current.copy('a');
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    await act(async () => {
      await result.current.copy('b');
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.status).toBe('copied');
  });

  it('clears the pending reset on unmount', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('a');
    });
    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
