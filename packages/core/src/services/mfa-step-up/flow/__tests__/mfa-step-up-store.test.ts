import { describe, expect, it, vi } from 'vitest';

import { createMfaStepUpError } from '../../mfa-step-up-api-error';
import type { MfaRequiredError } from '../../mfa-step-up-api-types';
import { createMfaStepUpStore } from '../mfa-step-up-store';

const mfaRequired = (mfaToken = 'a'): MfaRequiredError =>
  Object.assign(new Error('mfa_required'), {
    error: 'mfa_required' as const,
    error_description: '',
    mfa_token: mfaToken,
  });

// The dialog has to be mounted for a step-up to be answered.
const withDialog = () => {
  const store = createMfaStepUpStore();
  store.subscribe(() => undefined);
  return store;
};

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
    const store = createMfaStepUpStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const error = mfaRequired();

    void store.request(error);

    expect(store.getSnapshot()?.error).toBe(error);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('hands out the same object until the step-up ends', () => {
    const store = withDialog();
    void store.request(mfaRequired('first'));
    const open = store.getSnapshot();

    void store.request(mfaRequired('second'));

    expect(store.getSnapshot()).toBe(open);
  });

  it('lets a caller with another token join the open step-up, not queue behind it', async () => {
    const store = withDialog();
    const first = store.request(mfaRequired('a'));
    const second = store.request(mfaRequired('b'));

    store.getSnapshot()?.complete();

    await expect(Promise.all([first, second])).resolves.toBeDefined();
    expect(store.getSnapshot()).toBeUndefined();
  });

  it('fails every caller with a cancelled error that carries the error that opened the step-up', async () => {
    const store = withDialog();
    const opening = mfaRequired('a');
    const first = settled(store.request(opening));
    const second = settled(store.request(mfaRequired('b')));

    store.getSnapshot()?.cancel();

    expect(await first).toMatchObject({ code: 'cancelled', cause: opening });
    expect(await second).toBe(await first);
  });

  it('fails every caller with the failure it is given', async () => {
    const store = withDialog();
    const failure = createMfaStepUpError('unavailable');
    const waiting = settled(store.request(mfaRequired()));

    store.getSnapshot()?.cancel(failure);

    expect(await waiting).toBe(failure);
  });

  it('ignores a second settle, and a settle that comes after the next step-up opened', async () => {
    const store = withDialog();
    const first = store.request(mfaRequired('one'));
    const firstRequest = store.getSnapshot()!;
    firstRequest.complete();
    await first;
    const next = settled(store.request(mfaRequired('two')));

    firstRequest.cancel();
    firstRequest.complete();

    expect(store.getSnapshot()).toBeDefined();
    store.getSnapshot()?.complete();
    expect(await next).toBe('resolved');
  });

  it('stops telling a subscriber that unsubscribed', () => {
    const store = withDialog();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    void store.request(mfaRequired());

    expect(listener).not.toHaveBeenCalled();
  });

  it('rejects at once as unavailable when nothing can show the dialog', async () => {
    const store = createMfaStepUpStore();

    await expect(store.request(mfaRequired())).rejects.toMatchObject({ code: 'unavailable' });
    expect(store.getSnapshot()).toBeUndefined();
  });

  describe('when the last subscriber leaves', () => {
    it('fails the open step-up as unavailable, and the next request is refused at once', async () => {
      const store = createMfaStepUpStore();
      const unsubscribe = store.subscribe(() => undefined);
      const waiting = settled(store.request(mfaRequired()));

      unsubscribe();

      expect(await waiting).toMatchObject({ code: 'unavailable' });
      expect(store.getSnapshot()).toBeUndefined();
      await expect(store.request(mfaRequired())).rejects.toMatchObject({ code: 'unavailable' });
    });

    it('keeps the step-up open while another subscriber can still answer it', () => {
      const store = createMfaStepUpStore();
      const unsubscribeFirst = store.subscribe(() => undefined);
      store.subscribe(() => undefined);
      void store.request(mfaRequired());

      unsubscribeFirst();

      expect(store.getSnapshot()).toBeDefined();
    });

    it('ignores a subscriber that unsubscribes twice', () => {
      const store = createMfaStepUpStore();
      const unsubscribe = store.subscribe(() => undefined);
      unsubscribe();
      store.subscribe(() => undefined);
      void store.request(mfaRequired());

      unsubscribe();

      expect(store.getSnapshot()).toBeDefined();
    });
  });

  describe('a subscriber that throws', () => {
    const throwingStore = () => {
      const store = withDialog();
      store.subscribe(() => {
        throw new Error('listener failed');
      });
      return store;
    };

    it('still returns the open step-up to the caller, and tells the other subscribers', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const store = throwingStore();
      const other = vi.fn();
      store.subscribe(other);

      const waiting = store.request(mfaRequired());
      store.getSnapshot()?.complete();

      await expect(waiting).resolves.toBeUndefined();
      expect(other).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
