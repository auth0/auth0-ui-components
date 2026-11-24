import { describe, expect, it, vi } from 'vitest';

import { createMfaStepUpError } from '../mfa-step-up-errors';
import { createMfaStepUpStore } from '../mfa-step-up-store';

const settled = (promise: Promise<void>) =>
  promise.then(
    () => 'resolved',
    (error: unknown) => error,
  );

describe('createMfaStepUpStore', () => {
  it('has nothing open at first', () => {
    expect(createMfaStepUpStore().getSnapshot()).toBeUndefined();
  });

  it('opens a step-up with the error of the first caller, and tells subscribers', () => {
    const prompt = createMfaStepUpStore();
    const listener = vi.fn();
    prompt.subscribe(listener);
    const error = { error: 'mfa_required', mfa_token: 'a' };

    void prompt.request(error);

    expect(prompt.getSnapshot()?.error).toBe(error);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('hands out the same object until the step-up ends', () => {
    const prompt = createMfaStepUpStore();
    void prompt.request('first');
    const open = prompt.getSnapshot();

    void prompt.request('second');

    expect(prompt.getSnapshot()).toBe(open);
  });

  it('lets a caller with another token join the open step-up, not queue behind it', async () => {
    const prompt = createMfaStepUpStore();
    const first = prompt.request({ mfa_token: 'a' });
    const second = prompt.request({ mfa_token: 'b' });

    prompt.getSnapshot()?.complete();

    await expect(Promise.all([first, second])).resolves.toBeDefined();
    expect(prompt.getSnapshot()).toBeUndefined();
  });

  it('fails every caller with a cancelled error that carries the error that opened the step-up', async () => {
    const store = createMfaStepUpStore();
    const opening = { mfa_token: 'a' };
    const first = settled(store.request(opening));
    const second = settled(store.request({ mfa_token: 'b' }));

    store.getSnapshot()?.cancel();

    expect(await first).toMatchObject({ code: 'cancelled', cause: opening });
    expect(await second).toBe(await first);
  });

  it('fails every caller with the failure it is given', async () => {
    const prompt = createMfaStepUpStore();
    const failure = createMfaStepUpError('unavailable');
    const waiting = settled(prompt.request('x'));

    prompt.getSnapshot()?.cancel(failure);

    expect(await waiting).toBe(failure);
  });

  it('ignores a second settle, and a settle that comes after the next step-up opened', async () => {
    const prompt = createMfaStepUpStore();
    const first = prompt.request('one');
    const firstRequest = prompt.getSnapshot()!;
    firstRequest.complete();
    await first;
    const next = settled(prompt.request('two'));

    firstRequest.cancel();
    firstRequest.complete();

    expect(prompt.getSnapshot()).toBeDefined();
    prompt.getSnapshot()?.complete();
    expect(await next).toBe('resolved');
  });

  it('stops telling a subscriber that unsubscribed', () => {
    const prompt = createMfaStepUpStore();
    const listener = vi.fn();
    const unsubscribe = prompt.subscribe(listener);
    unsubscribe();

    void prompt.request('x');

    expect(listener).not.toHaveBeenCalled();
  });
});
