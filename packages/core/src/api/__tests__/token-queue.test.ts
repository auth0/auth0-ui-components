import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTokenQueue, waitFor } from '../token-queue';

import { createDeferred } from './__mocks__/deferred';

describe('token-queue', () => {
  describe('createTokenQueue', () => {
    it('returns the result of the task', async () => {
      const queue = createTokenQueue();

      await expect(queue.run(async () => 'token')).resolves.toBe('token');
    });

    it('runs one task at a time, in the order they were added', async () => {
      const queue = createTokenQueue();
      const first = createDeferred();
      const second = createDeferred();
      const events: string[] = [];

      const a = queue.run(async () => {
        events.push('a start');
        await first.promise;
        events.push('a end');
      });
      const b = queue.run(async () => {
        events.push('b start');
        await second.promise;
        events.push('b end');
      });

      await vi.waitFor(() => expect(events).toEqual(['a start']));
      first.resolve();
      await a;
      await vi.waitFor(() => expect(events).toEqual(['a start', 'a end', 'b start']));
      second.resolve();
      await b;

      expect(events).toEqual(['a start', 'a end', 'b start', 'b end']);
    });

    it('passes a failure to its caller without blocking the next task', async () => {
      const queue = createTokenQueue();

      const failing = queue.run(async () => {
        throw new Error('refresh failed');
      });
      const next = queue.run(async () => 'ok');

      await expect(failing).rejects.toThrow('refresh failed');
      await expect(next).resolves.toBe('ok');
    });

    describe('with a hold limit', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('releases the queue when a task never settles', async () => {
        const queue = createTokenQueue(100);
        void queue.run(() => new Promise<void>(() => undefined));
        const next = queue.run(async () => 'ran');

        await vi.advanceTimersByTimeAsync(99);
        const early = vi.fn();
        void next.then(early);
        await vi.advanceTimersByTimeAsync(0);
        expect(early).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        await expect(next).resolves.toBe('ran');
      });

      it('starts counting when a task starts, not when it was added', async () => {
        const queue = createTokenQueue(100);
        const starts: number[] = [];
        const slowTask = async () => {
          starts.push(Date.now());
          await new Promise((resolve) => setTimeout(resolve, 80));
        };

        const runs = [queue.run(slowTask), queue.run(slowTask), queue.run(slowTask)];
        await vi.advanceTimersByTimeAsync(300);
        await Promise.all(runs);

        expect(starts.map((time) => time - starts[0]!)).toEqual([0, 80, 160]);
      });
    });
  });

  describe('waitFor', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('resolves when the promise resolves', async () => {
      const done = vi.fn();
      void waitFor(Promise.resolve(), 1000).then(done);

      await vi.advanceTimersByTimeAsync(0);

      expect(done).toHaveBeenCalled();
    });

    it('resolves, without throwing, when the promise rejects', async () => {
      const done = vi.fn();
      void waitFor(Promise.reject(new Error('nope')), 1000).then(done);

      await vi.advanceTimersByTimeAsync(0);

      expect(done).toHaveBeenCalled();
    });

    it('resolves after the timeout when the promise never settles', async () => {
      const done = vi.fn();
      void waitFor(new Promise(() => undefined), 1000).then(done);

      await vi.advanceTimersByTimeAsync(999);
      expect(done).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(done).toHaveBeenCalled();
    });
  });
});
