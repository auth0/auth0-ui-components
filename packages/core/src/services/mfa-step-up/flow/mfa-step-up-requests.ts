/**
 * The API calls of the step-up flow: requirements, enroll, challenge and verify.
 * @module mfa-step-up-requests
 */
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
} from '../mfa-step-up-api-constants';
import {
  createMfaStepUpError,
  getApiErrorCode,
  getFatalErrorCode,
  isUnavailableError,
} from '../mfa-step-up-api-error';
import type { EnrollParams, MfaRequiredError, VerifyParams } from '../mfa-step-up-api-types';
import { isMfaRequiredError, normalizeMfaRequiredError } from '../mfa-step-up-api-utils';

import { MFA_STEP } from './mfa-step-up-flow-constants';
import type { MfaBlockReason, MfaRequestName, MfaStepUpOptions } from './mfa-step-up-flow-types';
import { resolveMfaRequirements } from './mfa-step-up-requirements';
import {
  getChallengeKey,
  getCurrentEnrollment,
  getEnrollKey,
  isChallenged,
  isFinal,
  isPush,
  isVerified,
} from './mfa-step-up-state';
import type { StepUpState, FlowStore } from './mfa-step-up-state';

const DEFAULT_RESEND_COOLDOWN_MS = 30_000;

/** `another-factor`: the code was right, but the server wants one more, so a new round started. */
export type VerifyOutcome = 'verified' | 'rejected' | 'another-factor';

/** `sent`: a new code or push went out. `already-sent`: the current one is reused. */
export type ChallengeResult = 'sent' | 'already-sent' | 'failed';

export type PushCheck =
  | 'pending'
  | 'slow-down'
  | 'approved'
  | 'denied'
  | 'expired'
  | 'another-factor'
  | 'unsupported'
  | 'stopped'
  | 'failed';

const PUSH_ANSWERS: Record<string, PushCheck> = {
  authorization_pending: 'pending',
  slow_down: 'slow-down',
  access_denied: 'denied',
  expired_token: 'expired',
  invalid_request: 'unsupported',
};

const toEnrollParams = ({ mfaToken, contact, selected }: StepUpState): EnrollParams => {
  const factor = selected?.factor;
  switch (factor) {
    case FACTOR_TYPE_EMAIL:
      return { mfaToken, factorType: FACTOR_TYPE_EMAIL, email: contact };
    case FACTOR_TYPE_SMS:
    case FACTOR_TYPE_VOICE:
      return { mfaToken, factorType: factor, phoneNumber: contact };
    case FACTOR_TYPE_OTP:
    case FACTOR_TYPE_PUSH:
      return { mfaToken, factorType: factor };
    default:
      throw new Error(`MFA step-up: cannot enroll "${factor}"`);
  }
};

const toVerifyParams = (state: StepUpState, code: string): VerifyParams => {
  const { mfaToken } = state;
  const type =
    state.selected?.authenticator?.authenticatorType ??
    getCurrentEnrollment(state)?.authenticatorType;
  if (isPush(state) && state.pushMode === 'code') return { mfaToken, otp: code };
  if (type === 'oob') {
    const key = getChallengeKey(state);
    const oobCode = key ? state.challenges[key]?.oobCode : undefined;
    if (!oobCode) {
      throw createMfaStepUpError('unexpected', { message: 'There is no challenge to verify.' });
    }
    return { mfaToken, oobCode, bindingCode: code };
  }
  if (type === FACTOR_TYPE_RECOVERY_CODE) return { mfaToken, recoveryCode: code };
  return { mfaToken, otp: code };
};

const getChallengedAuthenticatorId = (state: StepUpState) =>
  state.selected?.kind === 'enroll'
    ? getCurrentEnrollment(state)?.id
    : state.selected?.authenticator?.id;

/**
 * @param store - The flow's store. The requests read it and dispatch what happened.
 * @param options - The API client and the error callback.
 * @returns The requests. Each reports a failure, or that the flow ended, by returning `undefined`
 * or `false`.
 */
export function createStepUpRequests(
  store: FlowStore,
  {
    apiClient,
    isProxyMode = false,
    onError,
    resendCooldownMs = DEFAULT_RESEND_COOLDOWN_MS,
    now = Date.now,
  }: MfaStepUpOptions,
) {
  const { dispatch, getState } = store;

  const block = (reason: MfaBlockReason) =>
    dispatch({ type: 'flowEnded', status: 'blocked', reason });

  const isSettled = () => isFinal(getState()) || isVerified(getState());

  const sendRequest = async <T>(name: MfaRequestName, call: () => Promise<T>) => {
    dispatch({ type: 'requestStarted', name });
    try {
      const value = await call();
      if (isSettled()) return undefined;
      dispatch({ type: 'requestSucceeded' });
      return value;
    } catch (err) {
      if (isSettled()) return undefined;
      dispatch({ type: 'requestFailed', name, error: err });
      const endingCode =
        getFatalErrorCode(err) ?? (isUnavailableError(err) ? 'unavailable' : undefined);
      if (endingCode) block(endingCode);
      onError?.(err);
      return undefined;
    }
  };

  const ensureEnroll = async () => {
    const state = getState();
    const key = getEnrollKey(state);
    if (!state.selected || !key) return false;
    if (state.enrollments[key]) return true;

    const response = await sendRequest('enroll', () => apiClient.enroll(toEnrollParams(state)));
    if (response) dispatch({ type: 'enrolled', key, response });
    return !!response;
  };

  const sendChallenge = async (state: StepUpState) => {
    const authenticatorId = getChallengedAuthenticatorId(state);
    if (!authenticatorId) {
      throw createMfaStepUpError('unexpected', {
        message: 'There is no authenticator to challenge.',
      });
    }
    const { oobCode } = await apiClient.challenge({
      mfaToken: state.mfaToken,
      challengeType: 'oob',
      authenticatorId,
    });
    if (!oobCode) throw createMfaStepUpError('unexpected', { message: 'No oob_code was sent.' });
    return { oobCode };
  };

  const ensureChallenge = async (force = false): Promise<ChallengeResult> => {
    const state = getState();
    const key = getChallengeKey(state);
    if (!key) return 'failed';
    if (!force && state.challenges[key]) return 'already-sent';
    const pushEnded = state.pushPhase === 'denied' || state.pushPhase === 'expired';
    if (force && !pushEnded && now() < (state.resendAvailableAt ?? 0)) return 'already-sent';

    const response = await sendRequest('challenge', () => sendChallenge(state));
    if (!response) return 'failed';
    dispatch({ type: 'challenged', key, response, resendAvailableAt: now() + resendCooldownMs });
    return 'sent';
  };

  const startNextRound = (error: MfaRequiredError): 'another-factor' | 'rejected' => {
    const { mfa_token: mfaToken, mfa_requirements: mfaRequirements } =
      normalizeMfaRequiredError(error);
    if (!mfaToken) {
      block('token_invalid');
      return 'rejected';
    }
    dispatch({ type: 'roundStarted', mfaToken, mfaRequirements });
    return 'another-factor';
  };

  const verifyCode = async (input: string): Promise<VerifyOutcome> => {
    const state = getState();
    if (isFinal(state)) return 'rejected';
    if (isVerified(state)) return 'verified';

    const code = input.trim();
    if (!code) return 'rejected';

    const result = await sendRequest('verify', () =>
      apiClient.verify(toVerifyParams(state, code)).catch((err: unknown) => {
        if (isMfaRequiredError(err)) return err;
        throw err;
      }),
    );
    if (!result) return 'rejected';
    if (isMfaRequiredError(result)) return startNextRound(result);

    dispatch({ type: 'verified', recoveryCode: result.recovery_code });
    return 'verified';
  };

  const checkPush = async (signal: AbortSignal): Promise<PushCheck> => {
    const isStale = () => signal.aborted || isSettled();
    const state = getState();
    const key = getChallengeKey(state);
    const oobCode = key ? state.challenges[key]?.oobCode : undefined;
    if (!oobCode) return 'failed';

    try {
      await apiClient.verify({ mfaToken: state.mfaToken, oobCode });
    } catch (err) {
      if (isStale()) return 'stopped';
      if (isMfaRequiredError(err)) {
        return startNextRound(err) === 'another-factor' ? 'another-factor' : 'stopped';
      }
      const code = getApiErrorCode(err);
      const answer = PUSH_ANSWERS[code ?? ''];
      if (answer) return answer;

      const fatalCode = getFatalErrorCode(err);
      if (fatalCode) block(fatalCode);
      onError?.(err);
      return fatalCode ? 'stopped' : 'failed';
    }
    if (isStale()) return 'stopped';
    dispatch({ type: 'verified' });
    return 'approved';
  };

  return {
    resolveOptions: () => {
      const { mfaToken, mfaRequirements } = getState();
      return sendRequest('resolveRequirements', () =>
        resolveMfaRequirements(
          apiClient,
          { mfa_token: mfaToken, mfa_requirements: mfaRequirements },
          isProxyMode,
        ),
      );
    },

    ensureChallenge,

    runStepRequests: async (path: string) => {
      const needsEnroll = path === MFA_STEP.qr || path === MFA_STEP.verify;
      if (needsEnroll && !(await ensureEnroll())) return false;
      return isChallenged(getState(), path) ? (await ensureChallenge()) !== 'failed' : true;
    },

    verifyCode,

    checkPush,
  };
}
