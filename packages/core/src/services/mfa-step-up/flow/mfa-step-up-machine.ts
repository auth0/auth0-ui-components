/**
 * Headless machine for one MFA step-up. It holds the flow's state and the actions on it.
 * @module mfa-step-up-machine
 */
import { isMfaRequiredError, normalizeMfaRequiredError } from '../mfa-step-up-api-utils';

import { createMfaFlow } from './mfa-step-up-flow';
import { MFA_STEP } from './mfa-step-up-flow';
import type {
  MfaBlockReason,
  MfaFlowStep,
  MfaStepUpMachine,
  MfaStepUpOptions,
} from './mfa-step-up-flow-types';
import { createStepUpRequests } from './mfa-step-up-requests';
import { getFacts, isChallenged, isFinal, isPush } from './mfa-step-up-state';
import { createStepUpStore } from './mfa-step-up-state';

const DEFAULT_PUSH_POLL_INTERVAL_MS = 3000;
const DEFAULT_PUSH_TIMEOUT_MS = 120_000;
const DEFAULT_PUSH_APPROVED_DELAY_MS = 1200;
const SLOW_DOWN_STEP_MS = 5000;
const MAX_PUSH_CHECK_FAILURES = 3;

/**
 * Creates the machine. Nothing runs until `start()`.
 *
 * @param options - API client, the `mfa_required` error and flow customization.
 * @returns The machine.
 * @throws When the flow customization is invalid.
 */
export function createMfaStepUpMachine(options: MfaStepUpOptions): MfaStepUpMachine {
  const steps = createMfaFlow(options.flow);
  const mfaError = isMfaRequiredError(options.error)
    ? normalizeMfaRequiredError(options.error)
    : undefined;
  // A proxy built on the Next.js SDK cannot ask whether a push was approved, so no push is sent.
  const pushApproval = options.pushApproval ?? (options.isProxyMode ? 'code' : 'poll');
  const store = createStepUpStore({
    mfaToken: mfaError?.mfa_token ?? '',
    mfaRequirements: mfaError?.mfa_requirements,
    pushSupported: pushApproval === 'poll',
  });
  const requests = createStepUpRequests(store, options);
  const { dispatch, getState } = store;

  const {
    now = Date.now,
    pushPollIntervalMs = DEFAULT_PUSH_POLL_INTERVAL_MS,
    pushTimeoutMs = DEFAULT_PUSH_TIMEOUT_MS,
    pushApprovedDelayMs = DEFAULT_PUSH_APPROVED_DELAY_MS,
  } = options;

  let startPromise: Promise<void> | undefined;
  let pollGeneration = 0;
  let cancelWait: (() => void) | undefined;

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, ms);
      cancelWait = () => {
        clearTimeout(timer);
        resolve();
      };
    });

  const stopPolling = () => {
    pollGeneration += 1;
    cancelWait?.();
  };

  const blockFlow = (reason: MfaBlockReason, error?: unknown) =>
    dispatch({ type: 'flowEnded', status: 'blocked', reason, error });

  // Work a step does when the user leaves it, given what they entered: go on to the next step,
  // stay on this one, or start over because the server wants another factor.
  type StepExit = 'leave' | 'stay' | 'start-over';

  const leaveByCode = async (input: string): Promise<StepExit> => {
    const outcome = await requests.verifyCode(input);
    if (outcome === 'another-factor') return 'start-over';
    return outcome === 'verified' ? 'leave' : 'stay';
  };

  const onLeave: Partial<Record<string, (input: string) => Promise<StepExit>>> = {
    [MFA_STEP.list]: async (optionId) => {
      const option = getState().options.find((candidate) => candidate.id === optionId);
      dispatch({ type: 'optionSelected', option });
      return option ? 'leave' : 'stay';
    },
    [MFA_STEP.contact]: async (input) => {
      const contact = input.trim();
      dispatch({ type: 'contactEntered', contact });
      return contact ? 'leave' : 'stay';
    },
    [MFA_STEP.confirm]: async (optionId) => {
      const { options: available, selected } = getState();
      const option = optionId ? available.find((candidate) => candidate.id === optionId) : selected;
      dispatch({ type: 'optionSelected', option });
      return option ? 'leave' : 'stay';
    },
    [MFA_STEP.qr]: async () => {
      if (isPush(getState())) dispatch({ type: 'verified' });
      return 'leave';
    },
    [MFA_STEP.verify]: leaveByCode,
    [MFA_STEP.challenge]: leaveByCode,
  };

  const selectOnlyOption = () => {
    const { options: availableOptions, selected } = getState();
    if (options.flow?.skipListForSingleOption && availableOptions.length === 1 && !selected) {
      dispatch({ type: 'optionSelected', option: availableOptions[0] });
    }
  };

  // Reads the flow without changing it. A `when` or `hide` function that throws propagates.
  const findNextStep = (fromStep: string | undefined): MfaFlowStep | undefined => {
    const fromIndex =
      fromStep === undefined ? -1 : steps.findIndex((step) => step.path === fromStep);
    const facts = getFacts(getState());
    return steps.slice(fromIndex + 1).find((step) => step.isVisible(facts));
  };

  const findNextStepOrBlock = (fromStep: string | undefined) => {
    try {
      return { target: findNextStep(fromStep) };
    } catch (err) {
      blockFlow('unexpected', err);
      return undefined;
    }
  };

  const goToNextStep = async (fromStep: string | undefined): Promise<boolean> => {
    selectOnlyOption();

    const found = findNextStepOrBlock(fromStep);
    if (!found || isFinal(getState())) return false;

    const { target } = found;
    if (!target) {
      dispatch({ type: 'flowEnded', status: 'done' });
      return true;
    }

    if (!(await requests.runStepRequests(target.path))) {
      if (getState().current === undefined) blockFlow('unavailable');
      return false;
    }
    dispatch({ type: 'stepEntered', path: target.path });
    if (isPushChallenge() && getState().pushSupported) pollPush();
    return true;
  };

  const isPushChallenge = () => getState().current === MFA_STEP.challenge && isPush(getState());

  // Asks the server whether the push was approved, until it was, was denied, or has expired.
  const pollPush = async () => {
    stopPolling();
    const generation = pollGeneration;
    const isCurrent = () => generation === pollGeneration && !isFinal(getState());
    const deadline = now() + pushTimeoutMs;
    let interval = pushPollIntervalMs;
    let failures = 0;

    dispatch({ type: 'pushPhaseChanged', phase: 'waiting' });
    try {
      while (isCurrent()) {
        await wait(interval);
        if (!isCurrent()) return;
        if (now() >= deadline) return dispatch({ type: 'pushPhaseChanged', phase: 'expired' });

        const check = await requests.checkPush();
        if (!isCurrent()) return;

        if (check === 'denied' || check === 'expired') {
          return dispatch({ type: 'pushPhaseChanged', phase: check });
        }
        if (check === 'approved') {
          dispatch({ type: 'pushPhaseChanged', phase: 'approved' });
          await wait(pushApprovedDelayMs);
          if (isCurrent()) await goToNextStep(MFA_STEP.challenge);
          return;
        }
        if (check === 'another-factor') return await loadFirstStep();
        if (check === 'unsupported') return dispatch({ type: 'pushUnsupported' });
        if (check === 'stopped') return;
        if (check === 'slow-down') interval += SLOW_DOWN_STEP_MS;
        failures = check === 'failed' ? failures + 1 : 0;
        if (failures >= MAX_PUSH_CHECK_FAILURES) return blockFlow('unavailable');
      }
    } catch (err) {
      if (isCurrent()) blockFlow('unexpected', err);
    }
  };

  const runUserAction = async (action: () => Promise<void>) => {
    const { isBusy, status } = getState();
    if (isBusy || status !== 'active') return;

    dispatch({ type: 'actionStarted' });
    try {
      await action();
    } finally {
      dispatch({ type: 'actionEnded' });
    }
  };

  const next = (input = '') =>
    runUserAction(async () => {
      const leavingStep = getState().current;
      if (leavingStep === undefined) return;
      const exit = (await onLeave[leavingStep]?.(input)) ?? 'leave';
      if (exit === 'stay') return;
      if (exit === 'start-over') return loadFirstStep();
      const moved = await goToNextStep(leavingStep);
      if (!moved && leavingStep === MFA_STEP.list) dispatch({ type: 'optionSelected' });
    });

  // Loads what the user can pick from, and shows the first step. Also used for each additional
  // factor, once `roundStarted` has given the machine its new token.
  const loadFirstStep = async () => {
    const result = await requests.resolveOptions();
    if (isFinal(getState())) return;
    if (!result.ok) return blockFlow('unavailable');
    if (result.value.length === 0) return blockFlow('no_authenticators');

    dispatch({ type: 'optionsLoaded', options: result.value });
    await goToNextStep(undefined);
  };

  const start = async () => {
    // A flow that has ended sends nothing.
    if (isFinal(getState())) return;
    if (!mfaError?.mfa_token) {
      return blockFlow('unexpected', new Error('MFA step-up: the error carries no mfa_token'));
    }

    dispatch({ type: 'actionStarted' });
    try {
      await loadFirstStep();
    } finally {
      dispatch({ type: 'actionEnded' });
    }
  };

  return {
    start: () => (startPromise ??= start()),

    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,

    next,

    back: () => {
      stopPolling();
      dispatch({ type: 'wentBack' });
    },

    chooseAnotherFactor: () => {
      stopPolling();
      dispatch({ type: 'wentToList' });
    },

    resend: () =>
      runUserAction(async () => {
        const state = getState();
        if (!isChallenged(state, state.current)) return;
        const sent = await requests.ensureChallenge(true);
        if (sent && isPushChallenge() && getState().pushSupported) pollPush();
      }),

    switchToCode: () => {
      if (!isPushChallenge() || isFinal(getState())) return;
      stopPolling();
      dispatch({ type: 'pushModeChanged', mode: 'code' });
    },

    switchToPush: () =>
      runUserAction(async () => {
        if (!isPushChallenge() || !getState().pushSupported) return;
        dispatch({ type: 'pushModeChanged', mode: 'push' });
        await requests.ensureChallenge(true);
        if (!isFinal(getState()) && getState().pushSupported) pollPush();
      }),

    cancel: () => {
      stopPolling();
      dispatch({ type: 'flowEnded', status: 'cancelled', reason: 'user' });
    },

    dispose: () => {
      stopPolling();
      dispatch({ type: 'flowEnded', status: 'cancelled', reason: 'disposed' });
      store.clearListeners();
    },
  };
}
