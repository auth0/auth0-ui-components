import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MfaApiClient, VerifyParams } from '../../mfa-step-up-api-types';
import type {
  EnrollmentFactor,
  EnrollmentResponse,
  EnrollParams,
  MfaAuthenticator,
} from '../../mfa-step-up-api-types';
import type { MfaFlowConfig, MfaStepUpMachine } from '../mfa-step-up-flow-types';
import { createMfaStepUpMachine } from '../mfa-step-up-machine';

const TOKEN = 'mfa-token-secret';
const SECRET = 'otp-secret-value';
const CODES = ['rc-1', 'rc-2'];

const authenticator = (patch: Partial<MfaAuthenticator>): MfaAuthenticator => ({
  id: 'auth-1',
  authenticatorType: 'otp',
  active: true,
  ...patch,
});

function createClient(overrides: Partial<MfaApiClient> = {}, recoveryCodes?: string[]) {
  const calls: string[] = [];
  const verified = { id_token: '', access_token: '', expires_in: 1 };
  const apiClient: MfaApiClient = {
    getEnrollmentFactors: vi.fn(async () => {
      calls.push('getEnrollmentFactors');
      return [];
    }),
    getAuthenticators: vi.fn(async () => {
      calls.push('getAuthenticators');
      return [];
    }),
    enroll: vi.fn(async (p: EnrollParams) => {
      calls.push(`enroll:${p.factorType}`);
      return p.factorType === 'otp'
        ? {
            authenticatorType: 'otp' as const,
            secret: SECRET,
            barcodeUri: 'otpauth://x',
            recoveryCodes,
          }
        : {
            authenticatorType: 'oob' as const,
            oobChannel: 'sms' as const,
            id: 'enrolled-1',
            barcodeUri: p.factorType === 'push' ? 'guardian://x' : undefined,
            recoveryCodes,
          };
    }),
    challenge: vi.fn(async () => {
      calls.push('challenge');
      return { challengeType: 'oob' as const, oobCode: 'oob-1' };
    }),
    verify: vi.fn(async (params: VerifyParams) => {
      const sent = (['otp', 'oobCode', 'bindingCode', 'recoveryCode'] as const).filter(
        (field) => params[field] !== undefined,
      );
      calls.push(`verify:${sent.join(',')}`);
      return verified;
    }),
    ...overrides,
  };
  // The fake has every call, so a test can use them all. A test can still remove one.
  return { apiClient: apiClient as Required<MfaApiClient>, calls };
}

async function setup(
  apiClient: MfaApiClient,
  extra: {
    isProxyMode?: boolean;
    pushApproval?: 'poll' | 'code';
    flow?: MfaFlowConfig;
    requirements?: object;
    now?: () => number;
    resendCooldownMs?: number;
    pushPollIntervalMs?: number;
    pushTimeoutMs?: number;
    pushApprovedDelayMs?: number;
  } = {},
) {
  const onError = vi.fn();
  const stepUp = createMfaStepUpMachine({
    apiClient,
    isProxyMode: extra.isProxyMode,
    pushApproval: extra.pushApproval,
    flow: extra.flow,
    now: extra.now,
    resendCooldownMs: extra.resendCooldownMs,
    pushPollIntervalMs: extra.pushPollIntervalMs,
    pushTimeoutMs: extra.pushTimeoutMs,
    pushApprovedDelayMs: extra.pushApprovedDelayMs,
    error: {
      error: 'mfa_required',
      mfa_token: TOKEN,
      mfa_requirements: extra.requirements as never,
    },
    onError,
  });
  await stepUp.start();
  return { stepUp, onError };
}

const pick = (stepUp: MfaStepUpMachine, optionId: string) => stepUp.next(optionId);

// Picking an authenticator brings the user to the confirm step. Confirming moves on to the answer.
const pickAndConfirm = async (stepUp: MfaStepUpMachine, optionId: string) => {
  await pick(stepUp, optionId);
  await stepUp.next();
};

const stepOf = (c: MfaStepUpMachine) => c.getSnapshot().step;

const challengeSetup = (a: Partial<MfaAuthenticator>) => {
  const { apiClient, calls } = createClient({
    getAuthenticators: vi.fn(async () => [authenticator(a)]),
  });
  return { apiClient, calls };
};

describe('createMfaStepUpMachine', () => {
  describe('requirement resolution', () => {
    it('SPA: a challenge-only requirement lists the authenticators the SDK allows', async () => {
      // What auth0-spa-js does with `mfa_requirements: { challenge: [...] }`: no `enroll` list, so
      // no enrollment factors, and authenticators whose `type` is not in `challenge` are dropped.
      const challenge = ['otp', 'push-notification', 'recovery-code'];
      const everything = [
        authenticator({ id: 'code', authenticatorType: 'recovery-code', type: 'recovery-code' }),
        authenticator({ id: 'push', authenticatorType: 'oob', type: 'push-notification' }),
        authenticator({ id: 'mail', authenticatorType: 'oob', type: 'email' }),
        authenticator({ id: 'app', authenticatorType: 'otp', type: 'otp' }),
      ];
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => []),
        getAuthenticators: vi.fn(async () =>
          everything.filter((item) => item.type && challenge.includes(item.type)),
        ),
      });

      const { stepUp } = await setup(apiClient, {
        requirements: { challenge: challenge.map((type) => ({ type })) },
      });

      expect(stepUp.getSnapshot().options.map((option) => option.id)).toEqual([
        'challenge:code',
        'challenge:push',
        'challenge:app',
      ]);
      expect(apiClient.getEnrollmentFactors).toHaveBeenCalledWith(TOKEN);
      expect(apiClient.getAuthenticators).toHaveBeenCalledWith(TOKEN);
      expect(stepUp.getSnapshot().options.some((option) => option.kind === 'enroll')).toBe(false);
    });

    it('SPA: lists enrollment factors without recovery codes and skips getAuthenticators', async () => {
      const { apiClient, calls } = createClient({
        getEnrollmentFactors: vi.fn(async () => [
          { type: 'otp' },
          { type: 'recovery-code' },
          { type: 'phone' },
        ]),
      });
      const { stepUp } = await setup(apiClient);
      expect(calls).not.toContain('getAuthenticators');
      expect(stepUp.getSnapshot().options.map((o) => o.id)).toEqual(['enroll:otp', 'enroll:sms']);
      expect(stepOf(stepUp)).toBe('list');
    });

    it('SPA: falls back to active authenticators when no factor can be enrolled', async () => {
      const { apiClient, calls } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'a' }),
          authenticator({ id: 'b', active: false }),
        ]),
      });
      const { stepUp } = await setup(apiClient);
      expect(calls[0]).toBe('getEnrollmentFactors');
      expect(stepUp.getSnapshot().options.map((o) => o.id)).toEqual(['challenge:a']);
    });

    it.each([
      ['the list is shown', undefined],
      ['the list is skipped', { skipListForSingleOption: true }],
    ])(
      'blocks with no_authenticators when nothing can be enrolled or challenged and %s',
      async (_n, flow) => {
        const { apiClient } = createClient();
        const { stepUp } = await setup(apiClient, { flow });
        expect(stepUp.getSnapshot()).toMatchObject({
          status: 'blocked',
          reason: 'no_authenticators',
        });
      },
    );

    it('offers only the factors the flow can enroll', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [
          { type: 'webauthn-roaming' },
          { type: 'recovery-code' },
          { type: 'otp' },
          { type: 'totp' },
        ]),
      });
      const { stepUp } = await setup(apiClient);
      expect(stepUp.getSnapshot().options.map((option) => option.id)).toEqual(['enroll:otp']);
    });

    it('keeps the order the API gave', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'sms-b', authenticatorType: 'oob', type: 'phone' }),
          authenticator({ id: 'sms-a', authenticatorType: 'oob', type: 'phone' }),
        ]),
      });
      const { stepUp } = await setup(apiClient);

      expect(stepUp.getSnapshot().options.map((option) => option.id)).toEqual([
        'challenge:sms-b',
        'challenge:sms-a',
      ]);
    });

    it('SPA: one option for factors that normalize to the same type', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'phone' }, { type: 'sms' }]),
      });
      const { stepUp } = await setup(apiClient);
      expect(stepUp.getSnapshot().options.map((o) => o.id)).toEqual(['enroll:sms']);
    });

    it.each([
      [{ authenticatorType: 'oob' as const, type: 'email' as const }, 'email'],
      [{ authenticatorType: 'oob' as const, type: 'push-notification' as const }, 'push'],
      [{ authenticatorType: 'otp' as const }, 'otp'],
      [{ authenticatorType: 'recovery-code' as const }, 'recovery-code'],
    ])('names the factor of %j as %s', async (patch, factor) => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [authenticator(patch)]),
      });
      const { stepUp } = await setup(apiClient);
      expect(stepUp.getSnapshot().options[0]?.factor).toBe(factor);
    });

    it('does not offer authenticators the flow cannot challenge', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'passkey', authenticatorType: 'webauthn-roaming' as never }),
          authenticator({ id: 'no-channel', authenticatorType: 'oob' }),
          authenticator({ id: 'app', authenticatorType: 'otp' }),
        ]),
      });
      const { stepUp } = await setup(apiClient);

      expect(stepUp.getSnapshot().options.map((option) => option.id)).toEqual(['challenge:app']);
    });

    it('SPA without getEnrollmentFactors lists authenticators', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: undefined,
        getAuthenticators: vi.fn(async () => [authenticator({ id: 'a' })]),
      });
      const { stepUp } = await setup(apiClient);
      expect(stepUp.getSnapshot().options.map((o) => o.id)).toEqual(['challenge:a']);
    });

    it('proxy: lists authenticators first and never calls getEnrollmentFactors', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [authenticator({ id: 'a' })]),
      });
      const { stepUp } = await setup(apiClient, { isProxyMode: true });
      expect(apiClient.getAuthenticators).toHaveBeenCalledTimes(1);
      expect(apiClient.getEnrollmentFactors).not.toHaveBeenCalled();
      expect(stepUp.getSnapshot().options[0]?.kind).toBe('challenge');
    });

    it('proxy: falls back to mfa_requirements.enroll without recovery codes', async () => {
      const { apiClient } = createClient();
      const { stepUp } = await setup(apiClient, {
        isProxyMode: true,
        requirements: { enroll: [{ type: 'otp' }, { type: 'recovery-code' }] },
      });
      expect(stepUp.getSnapshot().options.map((o) => o.id)).toEqual(['enroll:otp']);
    });

    it('blocks with no_authenticators in proxy mode when there are no authenticators and no requirements', async () => {
      const { apiClient } = createClient();
      const { stepUp } = await setup(apiClient, { isProxyMode: true });
      expect(stepUp.getSnapshot()).toMatchObject({
        status: 'blocked',
        reason: 'no_authenticators',
      });
    });

    it('ends as cancelled and loads nothing when it is cancelled while the options load', async () => {
      let release!: () => void;
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(
          () =>
            new Promise<EnrollmentFactor[]>((resolve) => {
              release = () => resolve([{ type: 'otp' }]);
            }),
        ),
      });
      const stepUp = createMfaStepUpMachine({
        apiClient,
        error: { error: 'mfa_required', mfa_token: TOKEN },
      });
      const started = stepUp.start();
      await vi.waitFor(() => expect(apiClient.getEnrollmentFactors).toHaveBeenCalled());

      stepUp.cancel();
      release();
      await started;

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'cancelled', options: [] });
    });

    it('blocks and reports when requirements fail to load', async () => {
      const boom = new Error('boom');
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => Promise.reject(boom)),
      });
      const { stepUp, onError } = await setup(apiClient);
      expect(stepUp.getSnapshot()).toMatchObject({
        status: 'blocked',
        reason: 'unavailable',
      });
      expect(onError).toHaveBeenCalledWith(boom);
    });
  });

  describe('list', () => {
    it('stays on the list when no option, or an unknown one, is picked', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
      });
      const { stepUp } = await setup(apiClient);

      await stepUp.next();
      expect(stepOf(stepUp)).toBe('list');

      await pick(stepUp, 'enroll:nope');
      expect(stepOf(stepUp)).toBe('list');
      expect(apiClient.enroll).not.toHaveBeenCalled();
    });
  });

  describe('enroll', () => {
    const enrollSetup = (type: string, codes?: string[]) => {
      const { apiClient, calls } = createClient(
        { getEnrollmentFactors: vi.fn(async () => [{ type }]) },
        codes,
      );
      return { apiClient, calls };
    };

    it('OTP: enroll on selecting, qr, verify, then recovery', async () => {
      const { apiClient, calls } = enrollSetup('otp', CODES);
      const { stepUp } = await setup(apiClient);

      await pick(stepUp, 'enroll:otp');
      expect(calls).toEqual(['enroll:otp']);
      expect(stepOf(stepUp)).toBe('enroll.qr');
      expect(stepUp.getSnapshot().enrollment.secret).toBe(SECRET);

      await stepUp.next();
      expect(stepOf(stepUp)).toBe('enroll.verify');

      await stepUp.next('123456');
      expect(calls.at(-1)).toBe('verify:otp');
      expect(stepOf(stepUp)).toBe('enroll.recovery');
      expect(stepUp.getSnapshot().enrollment.recoveryCodes).toEqual(CODES);

      await stepUp.next();
      expect(stepUp.getSnapshot().status).toBe('done');
    });

    it('OTP without recovery codes finishes after verify', async () => {
      const { apiClient } = enrollSetup('otp');
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:otp');
      await stepUp.next();
      await stepUp.next('123456');
      expect(stepUp.getSnapshot().status).toBe('done');
    });

    it('push: install, enroll on Continue, qr, no verify call', async () => {
      const { apiClient, calls } = enrollSetup('push');
      const { stepUp } = await setup(apiClient);

      await pick(stepUp, 'enroll:push');
      expect(stepOf(stepUp)).toBe('enroll.install');
      expect(calls).not.toContain('enroll:push');

      await stepUp.next();
      expect(calls.at(-1)).toBe('enroll:push');
      expect(stepOf(stepUp)).toBe('enroll.qr');

      await stepUp.next();
      expect(stepUp.getSnapshot().status).toBe('done');
      expect(calls.some((c) => c.startsWith('verify'))).toBe(false);
      expect(stepUp.getSnapshot().facts.isVerified).toBe(true);
    });

    it('push: hiding install does not skip enroll', async () => {
      const { apiClient, calls } = enrollSetup('push');
      const { stepUp } = await setup(apiClient, { flow: { hide: { 'enroll.install': true } } });
      await pick(stepUp, 'enroll:push');
      expect(calls.at(-1)).toBe('enroll:push');
      expect(stepOf(stepUp)).toBe('enroll.qr');
    });

    it('push: going back and forward does not enroll twice', async () => {
      const { apiClient, calls } = enrollSetup('push');
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:push');
      await stepUp.next();
      stepUp.back();
      expect(stepOf(stepUp)).toBe('enroll.install');
      await stepUp.next();
      expect(calls.filter((c) => c === 'enroll:push')).toHaveLength(1);
    });

    it.each([
      ['phone', 'sms', '+14155550123'],
      ['voice', 'voice', '+14155550123'],
      ['email', 'email', 'a@b.com'],
    ])('%s: input, enroll on submit, challenge, verify', async (type, factor, contact) => {
      const { apiClient, calls } = enrollSetup(type, CODES);
      const { stepUp } = await setup(apiClient);

      await pick(stepUp, `enroll:${factor}`);
      expect(stepOf(stepUp)).toBe('enroll.contact');

      await stepUp.next('   ');
      expect(stepOf(stepUp)).toBe('enroll.contact');
      expect(calls).not.toContain(`enroll:${factor}`);

      await stepUp.next(contact);
      expect(calls.slice(-2)).toEqual([`enroll:${factor}`, 'challenge']);
      expect(stepOf(stepUp)).toBe('enroll.verify');

      await stepUp.next('123456');
      expect(calls.at(-1)).toBe('verify:oobCode,bindingCode');
      expect(stepOf(stepUp)).toBe('enroll.recovery');
    });

    it('trims the contact before it is sent', async () => {
      const { apiClient } = enrollSetup('email');
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:email');
      await stepUp.next('  a@b.com ');
      expect(vi.mocked(apiClient.enroll).mock.calls[0]?.[0]).toMatchObject({ email: 'a@b.com' });
    });

    it('does not enroll again for the same contact, and does for a new one', async () => {
      const { apiClient, calls } = enrollSetup('phone');
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:sms');
      await stepUp.next('+14155550123');
      stepUp.back();
      expect(stepUp.getSnapshot().contact).toBe('+14155550123');
      await stepUp.next(stepUp.getSnapshot().contact);
      expect(calls.filter((c) => c === 'enroll:sms')).toHaveLength(1);

      stepUp.back();
      await stepUp.next('+14155550199');
      expect(calls.filter((c) => c === 'enroll:sms')).toHaveLength(2);
    });

    it('does not carry a phone number into the email field after going back to the list', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'phone' }, { type: 'email' }]),
      });
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:sms');
      await stepUp.next('+14155550123');
      stepUp.back();
      stepUp.back();
      expect(stepOf(stepUp)).toBe('list');

      await pick(stepUp, 'enroll:email');
      expect(stepOf(stepUp)).toBe('enroll.contact');
      expect(stepUp.getSnapshot().contact).toBe('');
    });

    it('stays on the step and reports when enroll fails, then retries', async () => {
      const { apiClient } = enrollSetup('otp');
      const boom = new Error('boom');
      vi.mocked(apiClient.enroll).mockRejectedValueOnce(boom);
      const { stepUp, onError } = await setup(apiClient);

      await pick(stepUp, 'enroll:otp');
      expect(stepOf(stepUp)).toBe('list');
      expect(stepUp.getSnapshot().request.error).toBe(boom);
      expect(onError).toHaveBeenCalledWith(boom);

      await pick(stepUp, 'enroll:otp');
      expect(stepOf(stepUp)).toBe('enroll.qr');
    });
  });

  describe('challenge', () => {
    it('OTP: code form, then verify with otp', async () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');
      expect(stepOf(stepUp)).toBe('challenge');
      expect(calls).not.toContain('challenge');

      await stepUp.next('');
      expect(stepOf(stepUp)).toBe('challenge');
      expect(calls).not.toContain('verify:otp');

      await stepUp.next('123456');
      expect(calls.at(-1)).toBe('verify:otp');
      expect(stepUp.getSnapshot().status).toBe('done');
    });

    it('shows the new recovery code after a recovery code was used, until the user continues', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'recovery-code' });
      vi.mocked(apiClient.verify).mockResolvedValue({
        id_token: '',
        access_token: '',
        expires_in: 1,
        recovery_code: 'NEW-CODE-1',
      });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next('OLD-CODE');

      expect(stepOf(stepUp)).toBe('challenge.newRecoveryCode');
      expect(stepUp.getSnapshot().newRecoveryCode).toBe('NEW-CODE-1');
      expect(stepUp.getSnapshot().status).toBe('active');
      expect(stepUp.getSnapshot().canBack).toBe(false);

      await stepUp.next();
      expect(stepUp.getSnapshot().status).toBe('done');
    });

    it('finishes right after the code when no new recovery code comes back', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'recovery-code' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next('OLD-CODE');

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'done', newRecoveryCode: undefined });
    });

    it('ignores spaces around a code, and sends it without them', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next(' 123456 ');
      expect(vi.mocked(apiClient.verify).mock.calls[0]?.[0]).toEqual({
        mfaToken: TOKEN,
        otp: '123456',
      });
    });

    it('recovery code: any non-empty code, verify with recoveryCode', async () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'recovery-code' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');
      await stepUp.next('ABCD-EFGH');
      expect(calls.at(-1)).toBe('verify:recoveryCode');
    });

    it('OOB: challenge on entering, then verify with oobCode and bindingCode', async () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'oob', type: 'phone' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');
      expect(calls.at(-1)).toBe('challenge');

      await stepUp.next('123456');
      expect(vi.mocked(apiClient.verify).mock.calls[0]?.[0]).toEqual({
        mfaToken: TOKEN,
        oobCode: 'oob-1',
        bindingCode: '123456',
      });
    });

    describe('resending the code', () => {
      const withClock = async () => {
        let time = 1_000;
        const { apiClient, calls } = challengeSetup({ authenticatorType: 'oob', type: 'phone' });
        const { stepUp } = await setup(apiClient, { now: () => time, resendCooldownMs: 30_000 });
        await pickAndConfirm(stepUp, 'challenge:auth-1');
        return { stepUp, calls, advance: (ms: number) => (time += ms) };
      };

      it('starts the cooldown when the first code is sent', async () => {
        const { stepUp } = await withClock();

        expect(stepUp.getSnapshot().resendAvailableAt).toBe(31_000);
      });

      it('sends nothing, and keeps the time, when resend is pressed during the cooldown', async () => {
        const { stepUp, calls, advance } = await withClock();
        advance(29_999);

        await stepUp.resend();

        expect(calls.filter((c) => c === 'challenge')).toHaveLength(1);
        expect(stepUp.getSnapshot().resendAvailableAt).toBe(31_000);
      });

      it('sends a new code once the cooldown has passed, and starts it again', async () => {
        const { stepUp, calls, advance } = await withClock();
        advance(30_000);

        await stepUp.resend();

        expect(calls.filter((c) => c === 'challenge')).toHaveLength(2);
        expect(stepUp.getSnapshot().resendAvailableAt).toBe(61_000);
      });

      it('waits 30 seconds when no cooldown is given', async () => {
        const { apiClient } = challengeSetup({ authenticatorType: 'oob', type: 'phone' });
        const { stepUp } = await setup(apiClient, { now: () => 5_000 });
        await pickAndConfirm(stepUp, 'challenge:auth-1');

        expect(stepUp.getSnapshot().resendAvailableAt).toBe(35_000);
      });
    });

    it('resend does nothing for an authenticator that is not challenged', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.resend();
      expect(apiClient.challenge).not.toHaveBeenCalled();
    });

    describe('push', () => {
      const pending = () =>
        Object.assign(new Error('pending'), { data: { error: 'authorization_pending' } });
      const answered = (error: string) => Object.assign(new Error(error), { data: { error } });

      const pushSetup = async (extra = {}) => {
        vi.useFakeTimers();
        const { apiClient, calls } = challengeSetup({
          authenticatorType: 'oob',
          type: 'push-notification',
        });
        const { stepUp, onError } = await setup(apiClient, {
          pushPollIntervalMs: 1000,
          pushApprovedDelayMs: 500,
          ...extra,
        });
        await pickAndConfirm(stepUp, 'challenge:auth-1');
        return { apiClient, calls, stepUp, onError };
      };
      const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms);

      afterEach(() => vi.useRealTimers());

      it('sends the push on entering and waits, with no verify call yet', async () => {
        const { apiClient, calls, stepUp } = await pushSetup();

        expect(calls.at(-1)).toBe('challenge');
        expect(apiClient.verify).not.toHaveBeenCalled();
        expect(stepUp.getSnapshot().push).toEqual({
          mode: 'push',
          phase: 'waiting',
          canApprove: true,
        });
      });

      it('keeps asking while the answer is pending, then shows approved and completes', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify)
          .mockRejectedValueOnce(pending())
          .mockResolvedValueOnce({ access_token: 'token' });

        await tick(1000);
        expect(stepUp.getSnapshot().push?.phase).toBe('waiting');
        await tick(1000);
        expect(stepUp.getSnapshot().push?.phase).toBe('approved');
        expect(stepUp.getSnapshot().status).toBe('active');
        await tick(500);

        expect(stepUp.getSnapshot().status).toBe('done');
        expect(apiClient.verify).toHaveBeenLastCalledWith({ mfaToken: TOKEN, oobCode: 'oob-1' });
      });

      it.each([
        ['access_denied', 'denied'],
        ['expired_token', 'expired'],
      ])('shows %s as %s, and stops asking', async (error, phase) => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValue(answered(error));

        await tick(1000);
        expect(stepUp.getSnapshot().push?.phase).toBe(phase);
        await tick(10_000);

        expect(apiClient.verify).toHaveBeenCalledTimes(1);
        expect(stepUp.getSnapshot().status).toBe('active');
      });

      it('slows down when the server asks to', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify)
          .mockRejectedValueOnce(answered('slow_down'))
          .mockRejectedValue(pending());

        await tick(1000);
        await tick(5000);
        expect(apiClient.verify).toHaveBeenCalledTimes(1);
        await tick(1000);

        expect(apiClient.verify).toHaveBeenCalledTimes(2);
        stepUp.dispose();
      });

      it('expires on its own when the server never answers', async () => {
        const { apiClient, stepUp } = await pushSetup({ pushTimeoutMs: 3500 });
        vi.mocked(apiClient.verify).mockRejectedValue(pending());

        await tick(5000);

        expect(stepUp.getSnapshot().push?.phase).toBe('expired');
      });

      describe('behind a proxy, which cannot check a push', () => {
        const proxySetup = async () => {
          vi.useFakeTimers();
          const { apiClient, calls } = challengeSetup({
            authenticatorType: 'oob',
            type: 'push-notification',
          });
          const { stepUp } = await setup(apiClient, {
            isProxyMode: true,
            pushPollIntervalMs: 1000,
          });
          await pick(stepUp, 'challenge:auth-1');
          return { apiClient, calls, stepUp };
        };

        it('sends no push, and asks for the code from Guardian', async () => {
          const { apiClient, calls, stepUp } = await proxySetup();

          await stepUp.next();
          await vi.advanceTimersByTimeAsync(30_000);

          expect(stepUp.getSnapshot().step).toBe('challenge');
          expect(calls).not.toContain('challenge');
          expect(apiClient.verify).not.toHaveBeenCalled();
          expect(stepUp.getSnapshot().push).toEqual({
            mode: 'code',
            phase: 'waiting',
            canApprove: false,
          });
          expect(stepUp.getSnapshot().canResend).toBe(false);
        });

        it('already knows on the confirm step that no push will be sent', async () => {
          const { stepUp } = await proxySetup();

          expect(stepUp.getSnapshot().step).toBe('challenge.confirm');
          expect(stepUp.getSnapshot().push?.canApprove).toBe(false);
        });

        it('verifies the Guardian code as a one-time code', async () => {
          const { apiClient, stepUp } = await proxySetup();

          await stepUp.next();
          await stepUp.next('246100');

          expect(apiClient.verify).toHaveBeenCalledWith({ mfaToken: TOKEN, otp: '246100' });
          expect(stepUp.getSnapshot().status).toBe('done');
        });

        it('does not go to the push', async () => {
          const { calls, stepUp } = await proxySetup();
          await stepUp.next();

          await stepUp.switchToPush();

          expect(calls).not.toContain('challenge');
          expect(stepUp.getSnapshot().push?.mode).toBe('code');
        });

        it('sends the push and polls anyway when asked to, even behind a proxy', async () => {
          vi.useFakeTimers();
          const { apiClient, calls } = challengeSetup({
            authenticatorType: 'oob',
            type: 'push-notification',
          });
          vi.mocked(apiClient.verify).mockResolvedValue({ access_token: 'token' });
          const { stepUp } = await setup(apiClient, {
            isProxyMode: true,
            pushApproval: 'poll',
            pushPollIntervalMs: 1000,
            pushApprovedDelayMs: 0,
          });
          await pickAndConfirm(stepUp, 'challenge:auth-1');

          await vi.advanceTimersByTimeAsync(1000);

          expect(calls).toContain('challenge');
          expect(apiClient.verify).toHaveBeenCalledTimes(1);
          stepUp.dispose();
        });
      });

      it('falls back to the code when the backend cannot check a push, instead of failing', async () => {
        const { apiClient, stepUp, onError } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValue(
          Object.assign(new Error('Bad Request'), {
            status: 400,
            data: {
              error: 'invalid_request',
              error_description:
                'Missing verification credential (otp, oob_code+binding_code, or recovery_code required)',
            },
          }),
        );

        await tick(1000);
        await tick(10_000);

        expect(stepUp.getSnapshot().status).toBe('active');
        expect(stepUp.getSnapshot().push).toEqual({
          mode: 'code',
          phase: 'waiting',
          canApprove: false,
        });
        expect(apiClient.verify).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
      });

      it('does not go back to the push once it is known not to work, and the code still verifies', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValueOnce(
          Object.assign(new Error('Bad Request'), { data: { error: 'invalid_request' } }),
        );
        await tick(1000);

        await stepUp.switchToPush();
        await tick(10_000);
        await stepUp.next('246100');

        expect(stepUp.getSnapshot().status).toBe('done');
        expect(apiClient.verify).toHaveBeenLastCalledWith({ mfaToken: TOKEN, otp: '246100' });
      });

      it('blocks as unavailable after three failed checks in a row', async () => {
        const { apiClient, stepUp, onError } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValue(new Error('network'));

        await tick(3000);

        expect(stepUp.getSnapshot()).toMatchObject({ status: 'blocked', reason: 'unavailable' });
        expect(onError).toHaveBeenCalledTimes(3);
      });

      it('sends a new push on resend after a denial, even inside the cooldown', async () => {
        const { apiClient, calls, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValueOnce(answered('access_denied'));
        await tick(1000);

        await stepUp.resend();

        expect(calls.filter((call) => call === 'challenge')).toHaveLength(2);
        expect(stepUp.getSnapshot().push?.phase).toBe('waiting');
        stepUp.dispose();
      });

      it('does not send another push while one is waiting and the cooldown runs', async () => {
        const { calls, stepUp } = await pushSetup();

        await stepUp.resend();

        expect(calls.filter((call) => call === 'challenge')).toHaveLength(1);
        stepUp.dispose();
      });

      it('switches to the code, stops asking, and verifies it as a one-time code', async () => {
        const { apiClient, stepUp } = await pushSetup();

        stepUp.switchToCode();
        expect(stepUp.getSnapshot().push).toEqual({
          mode: 'code',
          phase: 'waiting',
          canApprove: true,
        });
        await tick(5000);
        expect(apiClient.verify).not.toHaveBeenCalled();
        await stepUp.next('246100');

        expect(apiClient.verify).toHaveBeenCalledWith({ mfaToken: TOKEN, otp: '246100' });
        expect(stepUp.getSnapshot().status).toBe('done');
      });

      it('switches back to the push and asks again', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockResolvedValue({ access_token: 'token' });
        stepUp.switchToCode();

        await stepUp.switchToPush();
        await tick(1000);

        expect(stepUp.getSnapshot().push?.phase).toBe('approved');
        stepUp.dispose();
      });

      it.each([
        ['going back', (stepUp: MfaStepUpMachine) => stepUp.back()],
        ['cancelling', (stepUp: MfaStepUpMachine) => stepUp.cancel()],
        ['disposing', (stepUp: MfaStepUpMachine) => stepUp.dispose()],
      ])('stops asking when %s', async (_name, leave) => {
        const { apiClient, stepUp } = await pushSetup();

        leave(stepUp);
        await tick(10_000);

        expect(apiClient.verify).not.toHaveBeenCalled();
      });

      it('still moves on after the approval when the user goes back during the short delay', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockResolvedValue({ access_token: 'token' });
        await tick(1000);
        expect(stepUp.getSnapshot().push?.phase).toBe('approved');

        stepUp.back();
        await tick(5000);

        expect(stepUp.getSnapshot().status).toBe('done');
      });

      it('keeps asking when there is no other factor to choose', async () => {
        const { apiClient, stepUp } = await pushSetup();

        stepUp.chooseAnotherFactor();
        await tick(3000);

        expect(apiClient.verify).toHaveBeenCalled();
        stepUp.dispose();
      });

      it('starts another round when the server asks for one after the approval', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValueOnce(
          Object.assign(new Error('mfa_required'), {
            data: { error: 'mfa_required', mfa_token: 'second-token' },
          }),
        );

        await tick(1000);

        expect(stepUp.getSnapshot()).toMatchObject({ status: 'active', step: 'list', round: 2 });
        stepUp.dispose();
      });

      it('blocks when the token expired while waiting', async () => {
        const { apiClient, stepUp } = await pushSetup();
        vi.mocked(apiClient.verify).mockRejectedValue({ status: 429 });

        await tick(1000);

        expect(stepUp.getSnapshot()).toMatchObject({ status: 'blocked', reason: 'rate_limited' });
      });
    });

    it('a wrong code is retryable: the user stays on the step', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      vi.mocked(apiClient.verify).mockRejectedValueOnce(
        Object.assign(new Error('x'), { status: 403 }),
      );
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');
      await stepUp.next('123456');
      expect(stepUp.getSnapshot().status).toBe('active');
      expect(stepUp.getSnapshot().request.error).toBeDefined();

      await stepUp.next('123456');
      expect(stepUp.getSnapshot().status).toBe('done');
    });

    it.each([
      ['a 429', { status: 429 }, 'rate_limited', 'rate_limited'],
      ['an expired token', { data: { error: 'expired_token' } }, 'token_expired', 'token_expired'],
      [
        'a token the server does not accept',
        { data: { error: 'invalid_token' } },
        'token_invalid',
        'token_invalid',
      ],
    ])('%s ends the flow as blocked, with a typed failure', async (_n, raw, reason, code) => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      vi.mocked(apiClient.verify).mockRejectedValueOnce(Object.assign(new Error('x'), raw));
      const { stepUp, onError } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next('123456');

      const snapshot = stepUp.getSnapshot();
      expect(snapshot).toMatchObject({ status: 'blocked', reason });
      expect(snapshot.failure?.code).toBe(code);
      expect(snapshot.failure?.cause).toMatchObject(raw);
      expect(onError).toHaveBeenCalled();
    });

    it.each([
      [
        'the proxy failing to reach Auth0',
        { status: 400, data: { error: 'unknown_error', error_description: 'fetch failed' } },
      ],
      ['a 503', { status: 503 }],
    ])('ends the flow as unavailable on %s', async (_name, raw) => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      vi.mocked(apiClient.verify).mockRejectedValueOnce(Object.assign(new Error('x'), raw));
      const { stepUp, onError } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next('123456');

      const snapshot = stepUp.getSnapshot();
      expect(snapshot).toMatchObject({ status: 'blocked', reason: 'unavailable' });
      expect(snapshot.failure?.code).toBe('unavailable');
      expect(onError).toHaveBeenCalled();
    });

    it('a wrong code (invalid_grant about the code) stays retryable and is not a failure', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      vi.mocked(apiClient.verify).mockRejectedValueOnce(
        Object.assign(new Error('x'), {
          data: { error: 'invalid_grant', error_description: 'Invalid otp_code.' },
        }),
      );
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next('123456');

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'active', failure: undefined });
    });

    it('gives the user cancelling a typed cancelled failure', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);

      stepUp.cancel();

      expect(stepUp.getSnapshot().failure?.code).toBe('cancelled');
    });

    it.each([['no options', createClient(), 'no_authenticators']])(
      'blocks with %s as a typed failure',
      async (_n, { apiClient }, code) => {
        const { stepUp } = await setup(apiClient);

        expect(stepUp.getSnapshot().failure?.code).toBe(code);
      },
    );
  });

  describe('additional factors', () => {
    const NEXT_TOKEN = 'second-token';
    const anotherRequired = (token = NEXT_TOKEN) =>
      Object.assign(new Error('mfa_required'), {
        status: 403,
        data: { error: 'mfa_required', mfa_token: token },
      });

    // The first factor is the authenticator app. The second is a recovery code.
    const twoRounds = () => {
      const { apiClient, calls } = createClient();
      vi.mocked(apiClient.getAuthenticators).mockImplementation(async (token) =>
        token === TOKEN
          ? [authenticator({ id: 'app', authenticatorType: 'otp' })]
          : [authenticator({ id: 'rc', authenticatorType: 'recovery-code' })],
      );
      return { apiClient, calls };
    };

    it('starts another round, with the new token and a fresh list, when the server asks for more', async () => {
      const { apiClient } = twoRounds();
      vi.mocked(apiClient.verify).mockRejectedValueOnce(anotherRequired());
      const { stepUp } = await setup(apiClient);
      expect(stepUp.getSnapshot().round).toBe(1);
      await pickAndConfirm(stepUp, 'challenge:app');

      await stepUp.next('123456');

      const snapshot = stepUp.getSnapshot();
      expect(snapshot).toMatchObject({ status: 'active', step: 'list', round: 2 });
      expect(snapshot.facts).toMatchObject({ round: 2, isVerified: false });
      expect(snapshot.options.map((option) => option.id)).toEqual(['challenge:rc']);
      expect(apiClient.getAuthenticators).toHaveBeenLastCalledWith(NEXT_TOKEN);
    });

    it('verifies the additional factor with the new token, and then completes', async () => {
      const { apiClient } = twoRounds();
      vi.mocked(apiClient.verify).mockRejectedValueOnce(anotherRequired());
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:app');
      await stepUp.next('123456');

      await pickAndConfirm(stepUp, 'challenge:rc');
      await stepUp.next('RECOVERY');

      expect(apiClient.verify).toHaveBeenCalledWith({
        mfaToken: NEXT_TOKEN,
        recoveryCode: 'RECOVERY',
      });
      expect(stepUp.getSnapshot()).toMatchObject({ status: 'done', round: 2 });
    });

    it('forgets the last round: no history, no pick, and going back is not possible', async () => {
      const { apiClient } = twoRounds();
      vi.mocked(apiClient.verify).mockRejectedValueOnce(anotherRequired());
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:app');
      await stepUp.next('123456');

      expect(stepUp.getSnapshot()).toMatchObject({ canBack: false, selected: undefined });
    });

    it('keeps asking for another factor for as long as the server asks', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'app', authenticatorType: 'otp' }),
        ]),
      });
      vi.mocked(apiClient.verify).mockRejectedValue(anotherRequired());
      const { stepUp } = await setup(apiClient);

      for (let round = 1; round <= 5; round++) {
        await pickAndConfirm(stepUp, 'challenge:app');
        await stepUp.next('123456');
      }

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'active', round: 6 });
      expect(apiClient.verify).toHaveBeenCalledTimes(5);
    });

    it('blocks as an invalid token when the new mfa_required carries no token', async () => {
      const { apiClient } = twoRounds();
      vi.mocked(apiClient.verify).mockRejectedValueOnce(
        Object.assign(new Error('mfa_required'), { data: { error: 'mfa_required' } }),
      );
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:app');

      await stepUp.next('123456');

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'blocked', reason: 'token_invalid' });
    });
  });

  describe('the confirm step', () => {
    it('shows the picked authenticator first, and sends nothing until it is confirmed', async () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'oob', type: 'phone' });
      const { stepUp } = await setup(apiClient);

      await pick(stepUp, 'challenge:auth-1');

      expect(stepOf(stepUp)).toBe('challenge.confirm');
      expect(calls).not.toContain('challenge');
      await stepUp.next();
      expect(stepOf(stepUp)).toBe('challenge');
      expect(calls.at(-1)).toBe('challenge');
    });

    it('lets the user confirm a different authenticator of the same kind', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'a', authenticatorType: 'oob', type: 'push-notification' }),
          authenticator({ id: 'b', authenticatorType: 'oob', type: 'push-notification' }),
        ]),
      });
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'challenge:a');

      await stepUp.next('challenge:b');

      expect(stepUp.getSnapshot().selected?.id).toBe('challenge:b');
      expect(apiClient.challenge).toHaveBeenCalledWith(
        expect.objectContaining({ authenticatorId: 'b' }),
      );
    });

    it('stays when the confirmed id is not one of the options', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'challenge:auth-1');

      await stepUp.next('challenge:unknown');

      expect(stepOf(stepUp)).toBe('challenge.confirm');
    });

    it('is shown for a backup code too', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'recovery-code' });
      const { stepUp } = await setup(apiClient);

      await pick(stepUp, 'challenge:auth-1');

      expect(stepOf(stepUp)).toBe('challenge.confirm');
    });

    it('goes back to the list from it', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'challenge:auth-1');

      stepUp.back();

      expect(stepOf(stepUp)).toBe('list');
    });

    it('is skipped when it is hidden, and the challenge goes out at once', async () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'oob', type: 'phone' });
      const { stepUp } = await setup(apiClient, { flow: { hide: { 'challenge.confirm': true } } });

      await pick(stepUp, 'challenge:auth-1');

      expect(stepOf(stepUp)).toBe('challenge');
      expect(calls.at(-1)).toBe('challenge');
    });
  });

  describe('lifecycle', () => {
    it('blocks as unexpected, with no API call, when the error is not mfa_required', async () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'otp' });
      const stepUp = createMfaStepUpMachine({ apiClient, error: new Error('boom') });

      await stepUp.start();

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'blocked', reason: 'unexpected' });
      expect(calls).toEqual([]);
    });

    it('makes no API call until it is started', () => {
      const { apiClient, calls } = challengeSetup({ authenticatorType: 'otp' });

      createMfaStepUpMachine({ apiClient, error: { error: 'mfa_required', mfa_token: TOKEN } });

      expect(calls).toEqual([]);
    });

    it('ignores back and chooseAnotherFactor while a request is in flight, but can still cancel', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      let finish: (value: object) => void = () => {};
      vi.mocked(apiClient.verify).mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      const verifying = stepUp.next('123456');
      stepUp.back();
      stepUp.chooseAnotherFactor();

      expect(stepOf(stepUp)).toBe('challenge');
      stepUp.cancel();
      finish({});
      await verifying;
      expect(stepUp.getSnapshot().status).toBe('cancelled');
    });

    it('shows a fatal error as blocked to onError', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      vi.mocked(apiClient.verify).mockRejectedValueOnce(
        Object.assign(new Error('x'), { status: 429 }),
      );
      const { stepUp, onError } = await setup(apiClient);
      let seenByCallback: string | undefined;
      onError.mockImplementation(() => (seenByCallback = stepUp.getSnapshot().status));
      await pickAndConfirm(stepUp, 'challenge:auth-1');

      await stepUp.next('123456');

      expect(seenByCallback).toBe('blocked');
    });

    it('sends nothing after it was disposed', async () => {
      const { apiClient } = challengeSetup({ authenticatorType: 'otp' });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:auth-1');
      stepUp.dispose();

      await stepUp.next('123456');

      expect(apiClient.verify).not.toHaveBeenCalled();
    });
  });

  describe('customization', () => {
    const otpClient = () =>
      createClient({ getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]) });

    it('runs a custom step at the end, after the evidence', async () => {
      const { apiClient } = otpClient();
      const { stepUp } = await setup(apiClient, { flow: { add: [{ id: 'consent' }] } });
      await pick(stepUp, 'enroll:otp');
      await stepUp.next();
      await stepUp.next('123456');
      expect(stepOf(stepUp)).toBe('consent');

      await stepUp.next();
      expect(stepUp.getSnapshot().status).toBe('done');
    });

    it('lets the user go back between steps added after verification, but not before it', async () => {
      const { apiClient } = createClient(
        { getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]) },
        CODES,
      );
      const { stepUp } = await setup(apiClient, {
        flow: { add: [{ id: 'consent' }, { id: 'survey' }] },
      });
      await pick(stepUp, 'enroll:otp');
      await stepUp.next();
      await stepUp.next('123456');
      expect(stepOf(stepUp)).toBe('enroll.recovery');
      expect(stepUp.getSnapshot().canBack).toBe(false);

      await stepUp.next();
      await stepUp.next();
      expect(stepOf(stepUp)).toBe('survey');

      stepUp.back();
      expect(stepOf(stepUp)).toBe('consent');
      stepUp.back();
      expect(stepOf(stepUp)).toBe('enroll.recovery');
      expect(stepUp.getSnapshot().canBack).toBe(false);
      expect(apiClient.verify).toHaveBeenCalledTimes(1);
    });

    it('skipping the list with one option goes straight to the first step', async () => {
      const { apiClient } = otpClient();
      const { stepUp } = await setup(apiClient, { flow: { skipListForSingleOption: true } });
      expect(stepOf(stepUp)).toBe('enroll.qr');
      expect(stepUp.getSnapshot().canBack).toBe(false);
    });

    it('still shows the list when there are several options', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }, { type: 'push' }]),
      });
      const { stepUp } = await setup(apiClient, { flow: { skipListForSingleOption: true } });
      expect(stepOf(stepUp)).toBe('list');
    });

    it('blocks with unavailable when the first step cannot start after the list is skipped', async () => {
      const { apiClient } = otpClient();
      vi.mocked(apiClient.enroll).mockRejectedValueOnce(new Error('boom'));
      const { stepUp } = await setup(apiClient, { flow: { skipListForSingleOption: true } });

      expect(stepUp.getSnapshot()).toMatchObject({ status: 'blocked', reason: 'unavailable' });
    });

    it('blocks instead of crashing when a condition throws', async () => {
      const { apiClient } = otpClient();
      const { stepUp } = await setup(apiClient, {
        flow: {
          add: [
            {
              id: 'bad',
              when: () => {
                throw new Error('oops');
              },
            },
          ],
        },
      });
      await pick(stepUp, 'enroll:otp');
      await stepUp.next();
      await stepUp.next('123456');
      expect(stepUp.getSnapshot()).toMatchObject({
        status: 'blocked',
        reason: 'unexpected',
      });
      expect((stepUp.getSnapshot().request.error as Error).message).toBe('oops');
    });

    it('throws when created with an invalid flow', () => {
      const { apiClient } = otpClient();
      expect(() =>
        createMfaStepUpMachine({
          apiClient,
          error: { error: 'mfa_required', mfa_token: TOKEN },
          flow: { hide: { 'enroll.qr': true } as never },
        }),
      ).toThrow(/cannot be hidden/);
    });
  });

  describe('snapshot flags', () => {
    it('canResend is true only where a challenge was sent', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'otp', authenticatorType: 'otp' }),
          authenticator({ id: 'sms', authenticatorType: 'oob', type: 'phone' }),
        ]),
      });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:otp');
      expect(stepUp.getSnapshot().canResend).toBe(false);
      stepUp.back();
      await pickAndConfirm(stepUp, 'challenge:sms');
      expect(stepUp.getSnapshot().canResend).toBe(true);
    });
  });

  describe('verify another way', () => {
    const twoAuthenticators = () =>
      createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'app', authenticatorType: 'otp' }),
          authenticator({ id: 'rc', authenticatorType: 'recovery-code' }),
        ]),
      });

    it('goes back to the list from a code screen, and lets the user pick again', async () => {
      const { apiClient } = twoAuthenticators();
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:app');
      expect(stepUp.getSnapshot().canChooseAnotherFactor).toBe(true);

      stepUp.chooseAnotherFactor();

      expect(stepOf(stepUp)).toBe('list');
      expect(stepUp.getSnapshot().selected).toBeUndefined();

      await pickAndConfirm(stepUp, 'challenge:rc');
      expect(stepOf(stepUp)).toBe('challenge');
      expect(stepUp.getSnapshot().selected?.id).toBe('challenge:rc');
    });

    it('is not offered when there is only one factor', async () => {
      const { apiClient } = createClient({
        getAuthenticators: vi.fn(async () => [
          authenticator({ id: 'app', authenticatorType: 'otp' }),
        ]),
      });
      const { stepUp } = await setup(apiClient);
      await pickAndConfirm(stepUp, 'challenge:app');

      expect(stepUp.getSnapshot().canChooseAnotherFactor).toBe(false);
      stepUp.chooseAnotherFactor();
      expect(stepOf(stepUp)).toBe('challenge');
    });

    it('is not offered once the user is verified', async () => {
      const { apiClient } = twoAuthenticators();
      const { stepUp } = await setup(apiClient, { flow: { add: [{ id: 'consent' }] } });
      await pickAndConfirm(stepUp, 'challenge:app');
      await stepUp.next('123456');
      expect(stepOf(stepUp)).toBe('consent');

      expect(stepUp.getSnapshot().canChooseAnotherFactor).toBe(false);
    });
  });

  describe('lifecycle', () => {
    it('creating has no side effects and start() twice sends each call once', async () => {
      const { apiClient } = createClient();
      const stepUp = createMfaStepUpMachine({
        apiClient,
        error: { error: 'mfa_required', mfa_token: TOKEN },
      });
      expect(apiClient.getEnrollmentFactors).not.toHaveBeenCalled();
      await Promise.all([stepUp.start(), stepUp.start()]);
      expect(apiClient.getEnrollmentFactors).toHaveBeenCalledTimes(1);
    });

    it('cancel is final and ignores late results', async () => {
      let release!: () => void;
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
        enroll: vi.fn(
          () =>
            new Promise<EnrollmentResponse>((resolve) => {
              release = () => resolve({ authenticatorType: 'otp', secret: 's', barcodeUri: 'u' });
            }),
        ),
      });
      const { stepUp } = await setup(apiClient);
      const pending = pick(stepUp, 'enroll:otp');
      await vi.waitFor(() => expect(apiClient.enroll).toHaveBeenCalled());
      stepUp.cancel();
      release();
      await pending;
      expect(stepUp.getSnapshot()).toMatchObject({ status: 'cancelled', reason: 'user' });
      expect(stepOf(stepUp)).toBe('list');
    });

    it('ignores a second action while one is running', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
      });
      const { stepUp } = await setup(apiClient);
      await Promise.all([pick(stepUp, 'enroll:otp'), pick(stepUp, 'enroll:otp')]);
      expect(apiClient.enroll).toHaveBeenCalledTimes(1);
    });

    it('dispose ends the flow, so later actions do nothing', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
      });
      const { stepUp } = await setup(apiClient);
      stepUp.dispose();
      await pick(stepUp, 'enroll:otp');
      expect(apiClient.enroll).not.toHaveBeenCalled();
      expect(stepUp.getSnapshot()).toMatchObject({ status: 'cancelled', reason: 'disposed' });
    });

    it('cannot go back while a request is running', async () => {
      let release!: () => void;
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'push' }]),
        enroll: vi.fn(
          () =>
            new Promise<EnrollmentResponse>((resolve) => {
              release = () =>
                resolve({ authenticatorType: 'oob', oobChannel: 'auth0', barcodeUri: 'u' });
            }),
        ),
      });
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:push');
      const pending = stepUp.next();
      await vi.waitFor(() => expect(apiClient.enroll).toHaveBeenCalled());
      expect(stepUp.getSnapshot().canBack).toBe(false);
      stepUp.back();
      expect(stepOf(stepUp)).toBe('enroll.install');
      release();
      await pending;
      expect(stepOf(stepUp)).toBe('enroll.qr');
    });

    it('sends nothing when it is started after it was disposed', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
      });
      const stepUp = createMfaStepUpMachine({
        apiClient,
        error: { error: 'mfa_required', mfa_token: TOKEN },
      });

      stepUp.dispose();
      await stepUp.start();

      expect(apiClient.getEnrollmentFactors).not.toHaveBeenCalled();
      expect(stepUp.getSnapshot()).toMatchObject({ status: 'cancelled', reason: 'disposed' });
    });

    it('is disposed without throwing, even when a subscriber throws', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { apiClient } = createClient();
      const stepUp = createMfaStepUpMachine({
        apiClient,
        error: { error: 'mfa_required', mfa_token: TOKEN },
      });
      stepUp.subscribe(() => {
        throw new Error('subscriber bug');
      });

      expect(() => stepUp.dispose()).not.toThrow();
      warn.mockRestore();
    });

    it('can have subscribe and getSnapshot used without the client, as React does', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
      });
      const stepUp = createMfaStepUpMachine({
        apiClient,
        error: { error: 'mfa_required', mfa_token: TOKEN },
      });
      const { subscribe, getSnapshot } = stepUp;
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      await stepUp.start();
      expect(listener).toHaveBeenCalled();
      expect(getSnapshot().step).toBe('list');
      unsubscribe();
    });

    it('returns the same snapshot object until the state changes', async () => {
      const { apiClient } = createClient({
        getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]),
      });
      const { stepUp } = await setup(apiClient);

      expect(stepUp.getSnapshot()).toBe(stepUp.getSnapshot());
      const before = stepUp.getSnapshot();
      await pick(stepUp, 'enroll:otp');
      expect(stepUp.getSnapshot()).not.toBe(before);
    });

    it('notifies subscribers and stops after dispose', async () => {
      const { apiClient } = createClient();
      const stepUp = createMfaStepUpMachine({
        apiClient,
        error: { error: 'mfa_required', mfa_token: TOKEN },
      });
      const listener = vi.fn();
      stepUp.subscribe(listener);
      await stepUp.start();
      expect(listener).toHaveBeenCalled();
      listener.mockClear();
      stepUp.dispose();
      listener.mockClear();
      await stepUp.next('anything');
      expect(listener).not.toHaveBeenCalled();
    });

    it('never exposes the token or secrets in the snapshot or its facts', async () => {
      const { apiClient } = createClient(
        { getEnrollmentFactors: vi.fn(async () => [{ type: 'otp' }]) },
        CODES,
      );
      const { stepUp } = await setup(apiClient);
      await pick(stepUp, 'enroll:otp');
      const { enrollment, ...publicSnapshot } = stepUp.getSnapshot();
      const json = JSON.stringify(publicSnapshot);
      for (const secret of [TOKEN, SECRET, ...CODES]) expect(json).not.toContain(secret);
      expect(enrollment.secret).toBe(SECRET);
    });
  });
});
