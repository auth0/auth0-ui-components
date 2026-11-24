/**
 * @module mfa-step-up-state
 */
import { FACTOR_TYPE_PUSH } from '../mfa-step-up-api-constants';
import { createMfaStepUpError, type MfaStepUpError } from '../mfa-step-up-api-error';
import type { EnrollmentResponse, MfaRequirements } from '../mfa-step-up-api-types';
import { requiresContactInput } from '../mfa-step-up-api-utils';

import { MFA_STEP } from './mfa-step-up-flow-constants';
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
import { createSubscribers } from './mfa-step-up-subscribers';

export interface StepUpState {
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
  verifiedAtDepth?: number;
  newRecoveryCode?: string;
  request: MfaStepUpSnapshot['request'];
  isBusy: boolean;
  enrollments: Record<string, EnrollmentResponse>;
  challenges: Record<string, { oobCode: string }>;
  resendAvailableAt?: number;
  pushMode: 'push' | 'code';
  pushPhase: MfaPushPhase;
  pushSupported: boolean;
}

export type InitialStepUp = Pick<StepUpState, 'mfaToken' | 'mfaRequirements'> & {
  pushSupported?: boolean;
};

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

const IS_FINAL_STATUS: Record<MfaFlowStatus, boolean> = {
  loading: false,
  active: false,
  done: true,
  blocked: true,
  cancelled: true,
};

export const isFinal = (state: StepUpState) => IS_FINAL_STATUS[state.status];

export const isVerified = (state: StepUpState) => state.verifiedAtDepth !== undefined;

export const canGoBack = (state: StepUpState) =>
  state.history.length > (state.verifiedAtDepth ?? 0) && !state.isBusy && !isFinal(state);

export const canChooseAnotherFactor = (state: StepUpState) =>
  state.options.length > 1 &&
  state.history.includes(MFA_STEP.list) &&
  !isVerified(state) &&
  !state.isBusy &&
  !isFinal(state);

const resetPush = ({ pushSupported }: Pick<StepUpState, 'pushSupported'>) =>
  ({ pushMode: pushSupported ? 'push' : 'code', pushPhase: 'waiting' }) as const;

const moveTo = (state: StepUpState, next: Partial<StepUpState>): StepUpState => ({
  ...state,
  ...resetPush(state),
  request: { isLoading: false },
  ...next,
});

/**
 * @param initial - The token and requirements of the `mfa_required` error that opened step-up.
 * @param initial.mfaToken - The `mfa_token`.
 * @param initial.mfaRequirements - What the error says is required.
 * @param initial.pushSupported - Whether a push can be approved here. Defaults to true.
 * @returns The state before anything has happened.
 */
export function createInitialState(initial: InitialStepUp): StepUpState {
  const pushSupported = initial.pushSupported ?? true;
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
    ...resetPush({ pushSupported }),
    pushSupported,
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
      return state.pushMode === event.mode && state.pushPhase === 'waiting'
        ? state
        : { ...state, pushMode: event.mode, pushPhase: 'waiting' };
    case 'pushUnsupported':
      return state.pushSupported
        ? { ...state, pushSupported: false, pushMode: 'code', pushPhase: 'waiting' }
        : state;
    case 'stepEntered':
      return moveTo(state, {
        history: state.current === undefined ? state.history : [...state.history, state.current],
        current: event.path,
        status: 'active',
      });
    case 'wentBack': {
      if (!canGoBack(state)) return state;
      const previous = state.history.at(-1);
      const goesToList = previous === MFA_STEP.list;
      return moveTo(state, {
        history: state.history.slice(0, -1),
        current: previous,
        selected: goesToList ? undefined : state.selected,
        contact: goesToList ? '' : state.contact,
      });
    }
    case 'wentToList': {
      const listIndex = state.history.indexOf(MFA_STEP.list);
      if (listIndex === -1 || !canChooseAnotherFactor(state)) return state;
      return moveTo(state, {
        history: state.history.slice(0, listIndex),
        current: MFA_STEP.list,
        selected: undefined,
        contact: '',
      });
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

export const getChallengeKey = (state: StepUpState) =>
  state.selected?.kind === 'enroll' ? getEnrollKey(state) : state.selected?.authenticator?.id;

export const getCurrentEnrollment = (state: StepUpState) => {
  const key = getEnrollKey(state);
  return key ? state.enrollments[key] : undefined;
};

export const isChallenged = (state: StepUpState, path: string | undefined): boolean => {
  if (path === MFA_STEP.verify) return getCurrentEnrollment(state)?.authenticatorType === 'oob';
  if (path === MFA_STEP.challenge) {
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
function getFailure(state: StepUpState): MfaStepUpError | undefined {
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
 * @returns A store. An event that leaves the state as it was notifies nobody.
 */
export function createFlowStore(initial: InitialStepUp) {
  let state = createInitialState(initial);
  let snapshot = toSnapshot(state);
  const subscribers = createSubscribers();

  return {
    getState: (): StepUpState => state,

    dispatch: (event: StepUpEvent) => {
      const nextState = reduce(state, event);
      if (nextState === state) return;
      state = nextState;
      snapshot = toSnapshot(state);
      subscribers.notify();
    },

    getSnapshot: () => snapshot,

    subscribe: subscribers.subscribe,

    clearListeners: subscribers.clear,
  };
}

export type FlowStore = ReturnType<typeof createFlowStore>;
