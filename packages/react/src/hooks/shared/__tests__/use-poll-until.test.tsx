import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePollUntil } from '@/hooks/shared/use-poll-until';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import type { UsePollUntilOptions } from '@/types/poll-types';

type Status = { status: 'in_progress' | 'success' };

const inProgress: Status = { status: 'in_progress' };
const success: Status = { status: 'success' };

const renderPoll = (options: Partial<UsePollUntilOptions<Status>>) => {
  const { wrapper } = createTestQueryClientWrapper();
  return renderHook(
    (props: Partial<UsePollUntilOptions<Status>>) =>
      usePollUntil<Status>({
        queryKey: ['poll-test'],
        queryFn: vi.fn().mockResolvedValue(inProgress),
        isDone: (data) => data.status !== 'in_progress',
        intervalMs: 1000,
        ...options,
        ...props,
      }),
    { wrapper, initialProps: {} },
  );
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe('usePollUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when the data stays in progress', () => {
    it('should fetch again after each interval', async () => {
      const queryFn = vi.fn().mockResolvedValue(inProgress);
      const { result } = renderPoll({ queryFn });

      await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
      await advance(1000);
      await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
      expect(result.current.isPolling).toBe(true);
      expect(result.current.attempts).toBe(2);
    });
  });

  describe('when isDone returns true', () => {
    it('should stop polling and expose the data', async () => {
      const queryFn = vi.fn().mockResolvedValueOnce(inProgress).mockResolvedValue(success);
      const { result } = renderPoll({ queryFn });

      await advance(1000);
      await waitFor(() => expect(result.current.data).toEqual(success));
      expect(result.current.isPolling).toBe(false);

      await advance(5000);
      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('when a fetch fails with a non-fatal error', () => {
    it('should keep polling', async () => {
      const queryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue(success);
      const { result } = renderPoll({ queryFn, isFatalError: () => false });

      await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
      expect(result.current.isPolling).toBe(true);

      await advance(1000);
      await waitFor(() => expect(result.current.data).toEqual(success));
      expect(result.current.isPolling).toBe(false);
    });
  });

  describe('when a fetch fails with a fatal error', () => {
    it('should stop polling', async () => {
      const fatal = { status: 404 };
      const queryFn = vi.fn().mockRejectedValue(fatal);
      const { result } = renderPoll({ queryFn, isFatalError: (error) => error === fatal });

      await waitFor(() => expect(result.current.error).toBe(fatal));
      expect(result.current.isPolling).toBe(false);

      await advance(5000);
      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('when maxAttempts is reached', () => {
    it('should time out', async () => {
      const queryFn = vi.fn().mockResolvedValue(inProgress);
      const { result } = renderPoll({ queryFn, maxAttempts: 2 });

      await advance(1000);
      await waitFor(() => expect(result.current.timedOut).toBe(true));
      expect(result.current.isPolling).toBe(false);

      await advance(5000);
      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('when maxDurationMs elapses', () => {
    it('should time out', async () => {
      const { result } = renderPoll({ maxDurationMs: 2500 });

      await advance(2500);
      await waitFor(() => expect(result.current.timedOut).toBe(true));
      expect(result.current.isPolling).toBe(false);
    });
  });

  describe('when stop is called', () => {
    it('should stop polling without timing out', async () => {
      const queryFn = vi.fn().mockResolvedValue(inProgress);
      const { result } = renderPoll({ queryFn });

      await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
      act(() => result.current.stop());
      await advance(5000);

      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(result.current.isPolling).toBe(false);
      expect(result.current.timedOut).toBe(false);
    });
  });

  describe('when enabled is false', () => {
    it('should not fetch', async () => {
      const queryFn = vi.fn().mockResolvedValue(inProgress);
      const { result } = renderPoll({ queryFn, enabled: false });

      await advance(5000);
      expect(queryFn).not.toHaveBeenCalled();
      expect(result.current.isPolling).toBe(false);
    });
  });

  describe('when the query key changes', () => {
    it('should reset attempts and poll the new key', async () => {
      const queryFn = vi.fn().mockResolvedValue(inProgress);
      const { result, rerender } = renderPoll({ queryFn, maxAttempts: 2 });

      await advance(1000);
      await waitFor(() => expect(result.current.timedOut).toBe(true));

      rerender({ queryKey: ['poll-test', 'next'] });
      expect(result.current.timedOut).toBe(false);
      await waitFor(() => expect(result.current.isPolling).toBe(true));
      expect(result.current.timedOut).toBe(false);
      expect(result.current.attempts).toBe(1);
    });
  });

  describe('when unmounted', () => {
    it('should stop fetching', async () => {
      const queryFn = vi.fn().mockResolvedValue(inProgress);
      const { unmount } = renderPoll({ queryFn });

      await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
      unmount();
      await advance(5000);

      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });
});
