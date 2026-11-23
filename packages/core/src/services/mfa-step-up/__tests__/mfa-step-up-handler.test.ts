import { afterEach, describe, expect, it, vi } from 'vitest';

import { handleMfaRequiredError } from '../mfa-step-up-handler';
import { mfaStepUpStore } from '../mfa-step-up-store';

const mfaRequired = { error: 'mfa_required', mfa_token: 'tok' };

// Plays the dialog: answers every step-up that opens.
const answerWith = (act: 'complete' | 'cancel') =>
  mfaStepUpStore.subscribe(() => {
    const request = mfaStepUpStore.getSnapshot();
    if (request) queueMicrotask(() => request[act]());
  });

describe('handleMfaRequiredError', () => {
  let stopAnswering: (() => void) | undefined;
  afterEach(() => stopAnswering?.());

  it('returns what the call returns, without opening anything', async () => {
    const call = vi.fn(async () => 'fine');

    await expect(handleMfaRequiredError(call)).resolves.toBe('fine');
    expect(call).toHaveBeenCalledTimes(1);
    expect(mfaStepUpStore.getSnapshot()).toBeUndefined();
  });

  it.each([
    ['a plain error', new Error('network')],
    ['an axios error that is not MFA', { response: { data: { error: 'forbidden' } } }],
  ])('rethrows %s', async (_name, error) => {
    await expect(
      handleMfaRequiredError(async () => {
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

    await expect(handleMfaRequiredError(call)).resolves.toBe('done');
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

    await handleMfaRequiredError(vi.fn().mockRejectedValueOnce(mfaRequired).mockResolvedValue('x'));

    expect(seen[0]).toMatchObject({ error: 'mfa_required', mfa_token: 'tok' });
  });

  it('fails with a cancelled error, and does not run the call again, when the user cancels', async () => {
    stopAnswering = answerWith('cancel');
    const call = vi.fn().mockRejectedValue(mfaRequired);

    await expect(handleMfaRequiredError(call)).rejects.toMatchObject({ code: 'cancelled' });
    expect(call).toHaveBeenCalledTimes(1);
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

    const results = await Promise.all([handleMfaRequiredError(a), handleMfaRequiredError(b)]);

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

    await expect(handleMfaRequiredError(call)).resolves.toBe('ok');
    expect(call).toHaveBeenCalledTimes(3);
  });
});
