import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePollUntil } from '@/hooks/shared/use-poll-until';
import type { UsePollUntilOptions } from '@/types/use-poll-until-types';

type Result = { done: boolean; delayMs?: number };

describe('usePollUntil', () => {
  const request = vi.fn<(signal: AbortSignal) => Promise<Result>>();
  const onDone = vi.fn();
  const onError = vi.fn();

  const renderPoll = (options: Partial<UsePollUntilOptions<Result>> = {}) =>
    renderHook(
      (props: Partial<UsePollUntilOptions<Result>>) =>
        usePollUntil<Result>({
          request,
          isDone: (result) => result.done,
          getInterval: () => 1_000,
          onDone,
          onError,
          immediate: false,
          ...props,
        }),
      { initialProps: options },
    );

  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    request.mockResolvedValue({ done: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not poll until started', async () => {
    const { result } = renderPoll();

    await advance(10_000);

    expect(request).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });

  it('polls at the interval until done', async () => {
    const { result } = renderPoll();
    act(() => result.current.start());
    expect(result.current.isPolling).toBe(true);

    await advance(999);
    expect(request).not.toHaveBeenCalled();
    await advance(1);
    expect(request).toHaveBeenCalledTimes(1);

    request.mockResolvedValueOnce({ done: true });
    await advance(1_000);

    expect(onDone).toHaveBeenCalledWith({ done: true });
    expect(result.current.isPolling).toBe(false);
    await advance(10_000);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('passes the elapsed time and last result to getInterval', async () => {
    const getInterval = vi.fn(
      ({ lastResult }: { lastResult?: Result }) => lastResult?.delayMs ?? 1_000,
    );
    const { result } = renderPoll({ getInterval });
    act(() => result.current.start());
    request.mockResolvedValueOnce({ done: false, delayMs: 5_000 });

    await advance(1_000);

    expect(getInterval).toHaveBeenLastCalledWith({
      elapsedMs: 1_000,
      attempts: 1,
      lastResult: { done: false, delayMs: 5_000 },
    });
    await advance(4_999);
    expect(request).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('stops and calls onExhausted when getInterval returns false', async () => {
    const onExhausted = vi.fn();
    const { result } = renderPoll({
      getInterval: ({ attempts }) => (attempts < 3 ? 1_000 : false),
      onExhausted,
    });
    act(() => result.current.start());

    await advance(10_000);

    expect(request).toHaveBeenCalledTimes(3);
    expect(onExhausted).toHaveBeenCalledTimes(1);
    expect(result.current.isPolling).toBe(false);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('counts attempts per session', async () => {
    const getInterval = vi.fn(() => 1_000);
    const { result } = renderPoll({ getInterval });
    act(() => result.current.start());
    await advance(2_000);

    act(() => result.current.start());

    expect(getInterval).toHaveBeenLastCalledWith({
      elapsedMs: 0,
      attempts: 0,
      lastResult: undefined,
    });
  });

  it('stops and calls onError when a request throws', async () => {
    const error = new Error('boom');
    request.mockRejectedValueOnce(error);
    const { result } = renderPoll();
    act(() => result.current.start());

    await advance(1_000);

    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.isPolling).toBe(false);
    await advance(10_000);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('stops on stop()', async () => {
    const { result } = renderPoll();
    act(() => result.current.start());

    act(() => result.current.stop());
    await advance(10_000);

    expect(request).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });

  it('stops on unmount', async () => {
    const { result, unmount } = renderPoll();
    act(() => result.current.start());

    unmount();
    await advance(10_000);

    expect(request).not.toHaveBeenCalled();
  });

  it('ignores the result of a request from before a restart', async () => {
    let resolveFirst: (value: Result) => void = () => {};
    request.mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)));
    const { result } = renderPoll();
    act(() => result.current.start());
    await advance(1_000);

    act(() => result.current.start());
    await act(async () => resolveFirst({ done: true }));

    expect(onDone).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(true);
  });

  it('polls immediately when the window regains focus', async () => {
    const { result } = renderPoll();
    act(() => result.current.start());

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('throttles focus polls to one per focusThrottleMs since the last request', async () => {
    const { result } = renderPoll({ focusThrottleMs: 2_000, getInterval: () => 60_000 });
    act(() => result.current.start());
    const focus = async () => {
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
    };

    await focus();
    expect(request).toHaveBeenCalledTimes(1);
    await advance(1_999);
    await focus();
    expect(request).toHaveBeenCalledTimes(1);
    await advance(1);
    await focus();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not listen for focus while idle', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const { result } = renderPoll();

    expect(addEventListener).not.toHaveBeenCalledWith('focus', expect.any(Function));
    act(() => result.current.start());
    expect(addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
  });

  it('sends the first request immediately by default', async () => {
    const { result } = renderPoll({ immediate: undefined });

    act(() => result.current.start());
    await act(async () => {});

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('stops and calls onError when isDone throws', async () => {
    const error = new Error('isDone failed');
    const { result } = renderPoll({
      isDone: () => {
        throw error;
      },
    });
    act(() => result.current.start());

    await advance(1_000);

    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.isPolling).toBe(false);
    await advance(10_000);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('aborts the in-flight request on stop, restart and unmount', async () => {
    const signals: AbortSignal[] = [];
    request.mockImplementation((signal) => {
      signals.push(signal);
      return new Promise(() => {});
    });
    const { result, unmount } = renderPoll();

    act(() => result.current.start());
    await advance(1_000);
    act(() => result.current.stop());
    expect(signals[0]?.aborted).toBe(true);

    act(() => result.current.start());
    await advance(1_000);
    act(() => result.current.start());
    expect(signals[1]?.aborted).toBe(true);

    await advance(1_000);
    unmount();
    expect(signals[2]?.aborted).toBe(true);
  });

  it('does not poll on focus when pollOnFocus is false', async () => {
    const { result } = renderPoll({ pollOnFocus: false });
    act(() => result.current.start());

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(request).not.toHaveBeenCalled();
  });

  it('does not send a second request while one is in flight', async () => {
    request.mockImplementation(() => new Promise(() => {}));
    const { result } = renderPoll();
    act(() => result.current.start());
    await advance(1_000);

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('uses the latest callbacks', async () => {
    const latestOnDone = vi.fn();
    const { result, rerender } = renderPoll();
    act(() => result.current.start());
    rerender({ onDone: latestOnDone });
    request.mockResolvedValueOnce({ done: true });

    await advance(1_000);

    expect(onDone).not.toHaveBeenCalled();
    expect(latestOnDone).toHaveBeenCalled();
  });
});
