/**
 * The API calls of the step-up flow: requirements, enroll, challenge and verify.
 * @module mfa-step-up-requests
 */
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_RECOVERY_CODE,
} from '../../my-account/user-mfa-management/user-mfa-management-constants';
import {
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
} from '../mfa-step-up-api-constants';
import type {
  EnrollParams,
  MfaRequiredError,
  MfaVerifyResult,
  VerifyParams,
} from '../mfa-step-up-api-types';
import { isMfaRequiredError, normalizeMfaRequiredError } from '../mfa-step-up-api-utils';
import {
  createMfaStepUpError,
  getApiErrorCode,
  getFatalErrorCode,
  isUnavailableError,
} from '../mfa-step-up-errors';

import { MFA_STEP } from './mfa-step-up-flow';
import type {
  MfaBlockReason,
  MfaOption,
  MfaRequestName,
  MfaStepUpOptions,
} from './mfa-step-up-flow-types';
import { resolveMfaRequirements } from './mfa-step-up-requirements';
import {
  MAX_ROUNDS,
  getChallengeKey,
  getCurrentEnrollment,
  getEnrollKey,
  isChallenged,
  isFinal,
  isPush,
  isVerified,
} from './mfa-step-up-state';
import type { StepUpState, StepUpStore } from './mfa-step-up-state';

const DEFAULT_RESEND_COOLDOWN_MS = 30_000;

type RequestResult<T> = { ok: true; value: T } | { ok: false };

/**
 * What came of the code the user entered. `another-factor`: it was right, but the server wants
 * one more, so a new round has started.
 */
export type VerifyOutcome = 'verified' | 'rejected' | 'another-factor';

/** What asking the server whether the push was approved came to. */
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

export interface StepUpRequests {
  resolveOptions(): Promise<RequestResult<MfaOption[]>>;
  ensureChallenge(force?: boolean): Promise<boolean>;
  runStepRequests(path: string): Promise<boolean>;
  verifyCode(input: string): Promise<VerifyOutcome>;
  checkPush(): Promise<PushCheck>;
}

type Verification =
  | { kind: 'verified'; result: MfaVerifyResult }
  | { kind: 'another'; error: MfaRequiredError };

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
      // The options list only offers the factors above.
      throw new Error(`MFA step-up: cannot enroll "${factor}"`);
  }
};

// Each kind of code is verified with the field of its own.
const toVerifyParams = (state: StepUpState, code: string): VerifyParams => {
  const { mfaToken } = state;
  const type =
    state.selected?.authenticator?.authenticatorType ??
    getCurrentEnrollment(state)?.authenticatorType;
  if (isPush(state) && state.pushMode === 'code') return { mfaToken, otp: code };
  if (type === 'oob') {
    const key = getChallengeKey(state);
    const oobCode = key ? state.challenges[key]?.oobCode : undefined;
    return { mfaToken, oobCode: oobCode ?? '', bindingCode: code };
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
 * @returns The requests. Each reports `false` or `{ ok: false }` when it failed or the flow ended.
 */
export function createStepUpRequests(
  store: StepUpStore,
  {
    apiClient,
    isProxyMode = false,
    onError,
    resendCooldownMs = DEFAULT_RESEND_COOLDOWN_MS,
    now = Date.now,
  }: MfaStepUpOptions,
): StepUpRequests {
  const { dispatch, getState } = store;

  const block = (reason: MfaBlockReason) =>
    dispatch({ type: 'flowEnded', status: 'blocked', reason });

  // An `onError` that throws is the integrator's bug. Say so, but do not break the flow.
  const reportError = (err: unknown) => {
    try {
      onError?.(err);
    } catch (callbackError) {
      console.warn('MFA step-up: the onError callback threw', callbackError);
    }
  };

  // A result that arrives after the flow ended is ignored.
  const sendRequest = async <T>(
    name: MfaRequestName,
    call: () => Promise<T>,
  ): Promise<RequestResult<T>> => {
    dispatch({ type: 'requestStarted', name });
    try {
      const value = await call();
      if (isFinal(getState())) return { ok: false };
      dispatch({ type: 'requestSucceeded' });
      return { ok: true, value };
    } catch (err) {
      if (isFinal(getState())) return { ok: false };
      dispatch({ type: 'requestFailed', name, error: err });
      const endingCode =
        getFatalErrorCode(err) ?? (isUnavailableError(err) ? 'unavailable' : undefined);
      if (endingCode) block(endingCode);
      reportError(err);
      return { ok: false };
    }
  };

  const ensureEnroll = async (): Promise<boolean> => {
    const state = getState();
    const key = getEnrollKey(state);
    if (!state.selected || !key) return false;
    if (state.enrollments[key]) return true;

    const result = await sendRequest('enroll', () => apiClient.enroll(toEnrollParams(getState())));
    if (result.ok) dispatch({ type: 'enrolled', key, response: result.value });
    return result.ok;
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

  const ensureChallenge = async (force = false): Promise<boolean> => {
    const state = getState();
    const key = getChallengeKey(state);
    if (!key) return false;
    if (!force && state.challenges[key]) return true;
    // A code was just sent. Another is not sent until the cooldown has passed, except after a push
    // that was denied or has expired.
    const pushEnded = state.pushPhase === 'denied' || state.pushPhase === 'expired';
    if (force && !pushEnded && now() < (state.resendAvailableAt ?? 0)) return false;

    const result = await sendRequest('challenge', () => sendChallenge(state));
    if (result.ok) {
      const resendAvailableAt = now() + resendCooldownMs;
      dispatch({ type: 'challenged', key, response: result.value, resendAvailableAt });
    }
    return result.ok;
  };

  // A right code can still not be enough: the server may answer `mfa_required` again.
  const verifyOrAskForMore = async (code: string): Promise<Verification> => {
    try {
      return { kind: 'verified', result: await apiClient.verify(toVerifyParams(getState(), code)) };
    } catch (err) {
      if (isMfaRequiredError(err))
        return { kind: 'another', error: normalizeMfaRequiredError(err) };
      throw err;
    }
  };

  const startNextRound = ({
    mfa_token: mfaToken,
    mfa_requirements: mfaRequirements,
  }: MfaRequiredError): VerifyOutcome => {
    if (!mfaToken) {
      block('token_invalid');
      return 'rejected';
    }
    if (getState().round >= MAX_ROUNDS) {
      block('max_challenges_exceeded');
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

    const result = await sendRequest('verify', () => verifyOrAskForMore(code));
    if (!result.ok) return 'rejected';
    if (result.value.kind === 'another') return startNextRound(result.value.error);

    dispatch({ type: 'verified', recoveryCode: result.value.result.recovery_code });
    return 'verified';
  };

  const PUSH_ANSWERS: Record<string, PushCheck> = {
    authorization_pending: 'pending',
    slow_down: 'slow-down',
    access_denied: 'denied',
    expired_token: 'expired',
  };

  // Asks whether the user approved the push. Waiting for an answer is not an error.
  const checkPush = async (): Promise<PushCheck> => {
    const state = getState();
    const key = getChallengeKey(state);
    const oobCode = key ? state.challenges[key]?.oobCode : undefined;
    if (!oobCode) return 'failed';

    try {
      await apiClient.verify({ mfaToken: state.mfaToken, oobCode });
    } catch (err) {
      if (isFinal(getState())) return 'stopped';
      if (isMfaRequiredError(err)) {
        return startNextRound(normalizeMfaRequiredError(err)) === 'another-factor'
          ? 'another-factor'
          : 'stopped';
      }
      const answer = PUSH_ANSWERS[getApiErrorCode(err) ?? ''];
      if (answer) return answer;
      // The backend turned the request away for its shape: it cannot check a push by `oob_code`.
      if (getApiErrorCode(err) === 'invalid_request') return 'unsupported';
      const fatalCode = getFatalErrorCode(err);
      if (fatalCode) {
        block(fatalCode);
        reportError(err);
        return 'stopped';
      }
      reportError(err);
      return 'failed';
    }
    if (isFinal(getState())) return 'stopped';
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

    // Sends the requests a step needs when it is entered.
    runStepRequests: async (path: string): Promise<boolean> => {
      const needsEnroll = path === MFA_STEP.qr || path === MFA_STEP.verify;
      if (needsEnroll && !(await ensureEnroll())) return false;
      return isChallenged(getState(), path) ? ensureChallenge() : true;
    },

    verifyCode,

    checkPush,
  };
}
