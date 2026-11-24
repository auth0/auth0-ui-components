import { afterEach, describe, expect, it, vi } from 'vitest';

import { mfaStepUpStore } from '../flow/mfa-step-up-store';
import { withMfaStepUp } from '../mfa-step-up-interceptor';

const mfaRequired = { error: 'mfa_required', mfa_token: 'tok' };

// Plays the dialog: answers every step-up that opens.
const answerWith = (act: 'complete' | 'cancel') =>
  mfaStepUpStore.subscribe(() => {
    const request = mfaStepUpStore.getSnapshot();
    if (request) queueMicrotask(() => request[act]());
  });

describe('withMfaStepUp', () => {
  let stopAnswering: (() => void) | undefined;
  afterEach(() => stopAnswering?.());

  it('returns what the call returns, without opening anything', async () => {
    const call = vi.fn(async () => 'fine');

    await expect(withMfaStepUp(call)).resolves.toBe('fine');
    expect(call).toHaveBeenCalledTimes(1);
    expect(mfaStepUpStore.getSnapshot()).toBeUndefined();
  });

  it.each([
    ['a plain error', new Error('network')],
    ['an axios error that is not MFA', { response: { data: { error: 'forbidden' } } }],
  ])('rethrows %s', async (_name, error) => {
    await expect(
      withMfaStepUp(async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });

  it.each([
    ['a thrown error', mfaRequired],
    ['an axios error', { response: { status: 403, data: mfaRequired } }],
  ])('after %s: asks for MFA, then runs the call again', async (_name, error) => {
    stopAnswering = answerWith('complete');
    const call = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('done');

    await expect(withMfaStepUp(call)).resolves.toBe('done');
  });

  it('treats a 403 response with an mfa_required body like a thrown error', async () => {
    stopAnswering = answerWith('complete');
    const ok = Response.json({ ok: true });
    const call = vi
      .fn()
      .mockResolvedValueOnce(Response.json(mfaRequired, { status: 403 }))
      .mockResolvedValueOnce(ok);

    await expect(withMfaStepUp(call)).resolves.toBe(ok);
    expect(call).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['a 403 that is not MFA', () => Response.json({ error: 'forbidden' }, { status: 403 })],
    ['a 403 without JSON', () => new Response('nope', { status: 403 })],
    ['a 500', () => Response.json({ error: 'boom' }, { status: 500 })],
  ])('hands back %s untouched', async (_name, make) => {
    const response = make();

    await expect(withMfaStepUp(async () => response)).resolves.toBe(response);
    expect(mfaStepUpStore.getSnapshot()).toBeUndefined();
  });

  it('gives the dialog the error that opened it', async () => {
    const seen: unknown[] = [];
    stopAnswering = mfaStepUpStore.subscribe(() => {
      const request = mfaStepUpStore.getSnapshot();
      if (request) {
        seen.push(request.error);
        queueMicrotask(request.complete);
      }
    });

    await withMfaStepUp(vi.fn().mockRejectedValueOnce(mfaRequired).mockResolvedValue('x'));

    expect(seen[0]).toMatchObject({ error: 'mfa_required', mfa_token: 'tok' });
  });

  it('fails with a cancelled error, and does not run the call again, when the user cancels', async () => {
    stopAnswering = answerWith('cancel');
    const call = vi.fn().mockRejectedValue(mfaRequired);

    await expect(withMfaStepUp(call)).rejects.toMatchObject({ code: 'cancelled' });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('does not ask again when a wrapped call was already cancelled', async () => {
    let opened = 0;
    stopAnswering = mfaStepUpStore.subscribe(() => {
      const request = mfaStepUpStore.getSnapshot();
      if (!request) return;
      opened += 1;
      queueMicrotask(() => request.cancel());
    });
    const inner = () => withMfaStepUp(() => Promise.reject(mfaRequired));

    await expect(withMfaStepUp(inner)).rejects.toMatchObject({ code: 'cancelled' });
    expect(opened).toBe(1);
  });

  it('shares one dialog between calls that fail together, and runs each again', async () => {
    let opened = 0;
    stopAnswering = mfaStepUpStore.subscribe(() => {
      const request = mfaStepUpStore.getSnapshot();
      if (request) {
        opened += 1;
        setTimeout(request.complete, 5);
      }
    });
    const make = () => vi.fn().mockRejectedValueOnce(mfaRequired).mockResolvedValue('ok');
    const [a, b] = [make(), make()];

    const results = await Promise.all([withMfaStepUp(a), withMfaStepUp(b)]);

    expect(results).toEqual(['ok', 'ok']);
    expect(opened).toBe(1);
  });

  it('asks again each time the server wants MFA again, until the call succeeds', async () => {
    stopAnswering = answerWith('complete');
    const call = vi
      .fn()
      .mockRejectedValueOnce(mfaRequired)
      .mockRejectedValueOnce(mfaRequired)
      .mockResolvedValue('ok');

    await expect(withMfaStepUp(call)).resolves.toBe('ok');
    expect(call).toHaveBeenCalledTimes(3);
  });
});
