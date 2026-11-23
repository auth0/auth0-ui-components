/**
 * The state of one step-up flow. Every change goes through `reduce`, which has no side effects.
 * @module mfa-step-up-state
 */
import { FACTOR_TYPE_PUSH } from '../mfa-step-up-api-constants';
import type { EnrollmentResponse, MfaRequirements } from '../mfa-step-up-api-types';
import { requiresContactInput } from '../mfa-step-up-api-utils';
import { createMfaStepUpError, type MfaStepUpError } from '../mfa-step-up-errors';

import { MFA_STEP } from './mfa-step-up-flow';
import type {
  MfaBlockReason,
  MfaCancelReason,
  MfaEnrollmentView,
  MfaFlowFacts,
  MfaFlowStatus,
  MfaOption,
  MfaPushPhase,
  MfaRequestName,
  MfaStepUpSnapshot,
} from './mfa-step-up-flow-types';

/** How many factors the user may be asked for in one step-up. */
export const MAX_ROUNDS = 3;

export interface StepUpState {
  /** The token of the current round. Each additional factor comes with a new one. */
  mfaToken: string;
  mfaRequirements?: MfaRequirements;
  round: number;
  status: MfaFlowStatus;
  reason?: MfaBlockReason | MfaCancelReason;
  current?: string;
  history: string[];
  options: MfaOption[];
  selected?: MfaOption;
  contact: string;
  /** How many steps had been entered when the user was verified. Steps before it are locked. */
  verifiedAtDepth?: number;
  newRecoveryCode?: string;
  request: MfaStepUpSnapshot['request'];
  /** A user action is running, so further actions are ignored. */
  isBusy: boolean;
  // Results are kept until their input changes, so going back and forward repeats no call.
  enrollments: Record<string, EnrollmentResponse>;
  challenges: Record<string, { oobCode: string }>;
  resendAvailableAt?: number;
  pushMode: 'push' | 'code';
  pushPhase: MfaPushPhase;
  // False when the backend cannot tell whether a push was approved: no push is sent then, and
  // the user answers with the code from the Guardian app.
  pushSupported: boolean;
}

export type StepUpEvent =
  | { type: 'actionStarted' }
  | { type: 'actionEnded' }
  | { type: 'requestStarted'; name: MfaRequestName }
  | { type: 'requestSucceeded' }
  | { type: 'requestFailed'; name: MfaRequestName; error: unknown }
  | { type: 'optionsLoaded'; options: MfaOption[] }
  | { type: 'optionSelected'; option?: MfaOption }
  | { type: 'contactEntered'; contact: string }
  | { type: 'enrolled'; key: string; response: EnrollmentResponse }
  | { type: 'challenged'; key: string; response: { oobCode: string }; resendAvailableAt: number }
  | { type: 'verified'; recoveryCode?: string }
  | { type: 'roundStarted'; mfaToken: string; mfaRequirements?: MfaRequirements }
  | { type: 'pushPhaseChanged'; phase: MfaPushPhase }
  | { type: 'pushModeChanged'; mode: 'push' | 'code' }
  | { type: 'pushUnsupported' }
  | { type: 'stepEntered'; path: string }
  | { type: 'wentBack' }
  | { type: 'wentToList' }
  | {
      type: 'flowEnded';
      status: Exclude<MfaFlowStatus, 'loading' | 'active'>;
      reason?: MfaBlockReason | MfaCancelReason;
      error?: unknown;
    };

// Keyed by every status, so adding one is a compile error until it is placed here.
const IS_FINAL_STATUS: Record<MfaFlowStatus, boolean> = {
  loading: false,
  active: false,
  done: true,
  blocked: true,
  cancelled: true,
};

export const isFinal = (state: StepUpState) => IS_FINAL_STATUS[state.status];

export const isVerified = (state: StepUpState) => state.verifiedAtDepth !== undefined;

// A step entered before the user was verified cannot be gone back to. Steps after it can.
export const canGoBack = (state: StepUpState) => {
  const previousIndex = state.history.length - 1;
  const isUnlocked = state.verifiedAtDepth === undefined || previousIndex >= state.verifiedAtDepth;
  return previousIndex >= 0 && isUnlocked && !state.isBusy && !isFinal(state);
};

// "Verify another way": only while there is another way, and before the user is verified.
export const canChooseAnotherFactor = (state: StepUpState) =>
  state.options.length > 1 &&
  state.history.includes(MFA_STEP.list) &&
  !isVerified(state) &&
  !state.isBusy &&
  !isFinal(state);

const resetPush = ({ pushSupported }: Pick<StepUpState, 'pushSupported'>) =>
  ({ pushMode: pushSupported ? 'push' : 'code', pushPhase: 'waiting' }) as const;

/**
 * @param initial - The token and requirements of the `mfa_required` error that opened step-up.
 * @param initial.mfaToken - The `mfa_token`.
 * @param initial.mfaRequirements - What the error says is required.
 * @param initial.pushSupported - Whether a push can be approved here. Defaults to true.
 * @returns The state before anything has happened.
 */
export function createInitialState(initial: {
  mfaToken: string;
  mfaRequirements?: MfaRequirements;
  pushSupported?: boolean;
}): StepUpState {
  return {
    mfaToken: initial.mfaToken,
    mfaRequirements: initial.mfaRequirements,
    round: 1,
    status: 'loading',
    history: [],
    options: [],
    contact: '',
    request: { isLoading: false },
    isBusy: false,
    enrollments: {},
    challenges: {},
    ...resetPush({ pushSupported: initial.pushSupported ?? true }),
    pushSupported: initial.pushSupported ?? true,
  };
}

/**
 * Once a flow has ended nothing changes it, so a request that finishes late is harmless.
 *
 * @param state - The current state.
 * @param event - What happened.
 * @returns The next state. It is the same object when nothing changed.
 */
export function reduce(state: StepUpState, event: StepUpEvent): StepUpState {
  if (isFinal(state)) return state;

  switch (event.type) {
    case 'actionStarted':
      return state.isBusy ? state : { ...state, isBusy: true };
    case 'actionEnded':
      return state.isBusy ? { ...state, isBusy: false } : state;
    case 'requestStarted':
      return { ...state, request: { name: event.name, isLoading: true } };
    case 'requestSucceeded':
      return { ...state, request: { isLoading: false } };
    case 'requestFailed':
      return { ...state, request: { name: event.name, isLoading: false, error: event.error } };
    case 'optionsLoaded':
      return { ...state, options: event.options };
    case 'optionSelected': {
      const isKnown = !event.option || state.options.some(({ id }) => id === event.option?.id);
      if (!isKnown || event.option?.id === state.selected?.id) return state;
      // A contact belongs to the factor it was entered for.
      return { ...state, selected: event.option, contact: '' };
    }
    case 'contactEntered':
      return event.contact === state.contact ? state : { ...state, contact: event.contact };
    case 'enrolled':
      return { ...state, enrollments: { ...state.enrollments, [event.key]: event.response } };
    case 'challenged':
      return {
        ...state,
        challenges: { ...state.challenges, [event.key]: event.response },
        resendAvailableAt: event.resendAvailableAt,
      };
    case 'verified':
      return isVerified(state)
        ? state
        : {
            ...state,
            verifiedAtDepth: state.history.length + 1,
            newRecoveryCode: event.recoveryCode,
          };
    case 'roundStarted':
      // The server wants another factor. Everything about the last one is behind the user.
      return {
        ...createInitialState({
          mfaToken: event.mfaToken,
          mfaRequirements: event.mfaRequirements,
          pushSupported: state.pushSupported,
        }),
        round: state.round + 1,
        isBusy: state.isBusy,
      };
    case 'pushPhaseChanged':
      return state.pushPhase === event.phase ? state : { ...state, pushPhase: event.phase };
    case 'pushModeChanged':
      return { ...state, pushMode: event.mode, pushPhase: 'waiting' };
    case 'pushUnsupported':
      return { ...state, pushSupported: false, pushMode: 'code', pushPhase: 'waiting' };
    case 'stepEntered':
      return {
        ...state,
        ...resetPush(state),
        history: state.current === undefined ? state.history : [...state.history, state.current],
        current: event.path,
        status: 'active',
        request: { isLoading: false },
      };
    case 'wentBack': {
      if (state.isBusy || !canGoBack(state)) return state;
      const previous = state.history.at(-1);
      const goesToList = previous === MFA_STEP.list;
      return {
        ...state,
        history: state.history.slice(0, -1),
        current: previous,
        selected: goesToList ? undefined : state.selected,
        contact: goesToList ? '' : state.contact,
        ...resetPush(state),
        request: { isLoading: false },
      };
    }
    case 'wentToList': {
      const listIndex = state.history.indexOf(MFA_STEP.list);
      if (state.isBusy || listIndex === -1 || !canChooseAnotherFactor(state)) return state;
      return {
        ...state,
        history: state.history.slice(0, listIndex),
        current: MFA_STEP.list,
        selected: undefined,
        contact: '',
        ...resetPush(state),
        request: { isLoading: false },
      };
    }
    case 'flowEnded':
      return {
        ...state,
        status: event.status,
        reason: event.reason,
        isBusy: false,
        request: {
          ...state.request,
          isLoading: false,
          ...(event.error === undefined ? {} : { error: event.error }),
        },
      };
  }
}

export const isPush = (state: StepUpState) => state.selected?.factor === FACTOR_TYPE_PUSH;

export const getEnrollKey = ({ selected, contact }: StepUpState) =>
  selected?.kind === 'enroll'
    ? `${selected.factor}|${requiresContactInput(selected.factor) ? contact : ''}`
    : undefined;

// A challenge is tied to one enrollment, so a new contact gets a new key and a new challenge.
export const getChallengeKey = (state: StepUpState) =>
  state.selected?.kind === 'enroll' ? getEnrollKey(state) : state.selected?.authenticator?.id;

export const getCurrentEnrollment = (state: StepUpState) => {
  const key = getEnrollKey(state);
  return key ? state.enrollments[key] : undefined;
};

// Only out-of-band authenticators (SMS, voice, email, push) are challenged.
export const isChallenged = (state: StepUpState, path: string | undefined): boolean => {
  if (path === MFA_STEP.verify) return getCurrentEnrollment(state)?.authenticatorType === 'oob';
  if (path === MFA_STEP.challenge) {
    // A push that cannot be approved here is not sent: the user reads the code from the app.
    if (isPush(state) && !state.pushSupported) return false;
    return state.selected?.authenticator?.authenticatorType === 'oob';
  }
  return false;
};

export const getFacts = (state: StepUpState): MfaFlowFacts => ({
  mode: state.selected?.kind,
  factor: state.selected?.factor,
  optionCount: state.options.length,
  enrollment: { hasRecoveryCodes: !!getCurrentEnrollment(state)?.recoveryCodes?.length },
  isVerified: isVerified(state),
  round: state.round,
  hasNewRecoveryCode: !!state.newRecoveryCode,
});

const getPushView = (state: StepUpState) =>
  (state.current === MFA_STEP.challenge || state.current === MFA_STEP.confirm) &&
  state.selected?.kind === 'challenge' &&
  isPush(state)
    ? { mode: state.pushMode, phase: state.pushPhase, canApprove: state.pushSupported }
    : undefined;

const getEnrollmentView = (state: StepUpState): MfaEnrollmentView => {
  const enrollment = getCurrentEnrollment(state);
  if (!enrollment) return {};
  return {
    authenticatorType: enrollment.authenticatorType,
    barcodeUri: enrollment.barcodeUri,
    recoveryCodes: enrollment.recoveryCodes,
    secret: 'secret' in enrollment ? enrollment.secret : undefined,
  };
};

/**
 * @param state - The current state.
 * @returns Why the flow ended without the user passing MFA, as the error a caller receives.
 */
export function getFailure(state: StepUpState): MfaStepUpError | undefined {
  if (state.status === 'cancelled') return createMfaStepUpError('cancelled');
  if (state.status === 'blocked' && state.reason) {
    return createMfaStepUpError(state.reason as MfaBlockReason, { cause: state.request.error });
  }
  return undefined;
}

/**
 * @param state - The current state.
 * @returns What adapters render. It holds the one secret the screens need, in `enrollment`.
 */
export function toSnapshot(state: StepUpState): MfaStepUpSnapshot {
  return {
    status: state.status,
    step: state.current,
    canBack: canGoBack(state),
    canChooseAnotherFactor: canChooseAnotherFactor(state),
    canResend: state.status === 'active' && !state.isBusy && isChallenged(state, state.current),
    resendAvailableAt: state.resendAvailableAt,
    reason: state.reason,
    failure: getFailure(state),
    round: state.round,
    options: state.options,
    selected: state.selected,
    facts: getFacts(state),
    request: state.request,
    contact: state.contact,
    enrollment: getEnrollmentView(state),
    push: getPushView(state),
    newRecoveryCode: state.newRecoveryCode,
  };
}

/**
 * @param initial - The token and requirements of the error that opened step-up.
 * @param initial.mfaToken - The `mfa_token`.
 * @param initial.mfaRequirements - What the error says is required.
 * @param initial.pushSupported - Whether a push can be approved here. Defaults to true.
 * @returns A store. Dispatching an event that changes nothing notifies nobody.
 */
export function createStepUpStore(initial: {
  mfaToken: string;
  mfaRequirements?: MfaRequirements;
  pushSupported?: boolean;
}) {
  let state = createInitialState(initial);
  let snapshot = toSnapshot(state);
  const listeners = new Set<() => void>();

  return {
    getState: (): StepUpState => state,

    dispatch: (event: StepUpEvent) => {
      const nextState = reduce(state, event);
      if (nextState === state) return;
      state = nextState;
      snapshot = toSnapshot(state);
      // Listeners only learn that something changed and then read the latest snapshot. One that
      // throws must not stop the others, and one that was removed is not called.
      for (const listener of [...listeners]) {
        if (!listeners.has(listener)) continue;
        try {
          listener();
        } catch (listenerError) {
          console.warn('MFA step-up: a subscriber threw', listenerError);
        }
      }
    },

    getSnapshot: () => snapshot,

    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    clearListeners: () => listeners.clear(),
  };
}

export type StepUpStore = ReturnType<typeof createStepUpStore>;
