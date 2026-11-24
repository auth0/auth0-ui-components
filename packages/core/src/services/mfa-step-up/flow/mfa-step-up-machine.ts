/**
 * Headless machine for one MFA step-up. It holds the flow's state and the actions on it.
 * @module mfa-step-up-machine
 */
import { isMfaRequiredError, normalizeMfaRequiredError } from '../mfa-step-up-api-utils';

import { createMfaFlow, MFA_STEP } from './mfa-step-up-flow';
import type {
  MfaBlockReason,
  MfaFlowStep,
  MfaStepUpMachine,
  MfaStepUpOptions,
} from './mfa-step-up-flow-types';
import { createStepUpRequests } from './mfa-step-up-requests';
import {
  canChooseAnotherFactor,
  canGoBack,
  createStepUpStore,
  getFacts,
  isChallenged,
  isFinal,
  isPush,
  isVerified,
} from './mfa-step-up-state';

const DEFAULT_PUSH_POLL_INTERVAL_MS = 3000;
const DEFAULT_PUSH_TIMEOUT_MS = 120_000;
const DEFAULT_PUSH_APPROVED_DELAY_MS = 1200;
const SLOW_DOWN_STEP_MS = 5000;
const MAX_PUSH_CHECK_FAILURES = 3;

type StepExit = 'leave' | 'stay' | 'start-over';

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });

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
  let polling: AbortController | undefined;

  const stopPolling = () => {
    polling?.abort();
    polling = undefined;
  };

  const blockFlow = (reason: MfaBlockReason, error?: unknown) =>
    dispatch({ type: 'flowEnded', status: 'blocked', reason, error });

  const isPushChallenge = () => getState().current === MFA_STEP.challenge && isPush(getState());

  const canPollPush = () => isPushChallenge() && getState().pushSupported && !isFinal(getState());

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

  const findNextStep = (fromStep: string | undefined): MfaFlowStep | undefined => {
    const fromIndex =
      fromStep === undefined ? -1 : steps.findIndex((step) => step.path === fromStep);
    const facts = getFacts(getState());
    return steps.slice(fromIndex + 1).find((step) => step.isVisible(facts));
  };

  const goToNextStep = async (fromStep: string | undefined): Promise<boolean> => {
    selectOnlyOption();

    let target: MfaFlowStep | undefined;
    try {
      target = findNextStep(fromStep);
    } catch (err) {
      blockFlow('unexpected', err);
      return false;
    }
    if (isFinal(getState())) return false;

    if (!target) {
      dispatch({ type: 'flowEnded', status: 'done' });
      return true;
    }

    if (!(await requests.runStepRequests(target.path))) {
      if (getState().current === undefined) blockFlow('unavailable');
      return false;
    }
    dispatch({ type: 'stepEntered', path: target.path });
    if (canPollPush()) void pollPush();
    return true;
  };

  const pollPush = async () => {
    stopPolling();
    const { signal } = (polling = new AbortController());
    const isCurrent = () => !signal.aborted && !isFinal(getState());
    const deadline = now() + pushTimeoutMs;
    let interval = pushPollIntervalMs;
    let failures = 0;

    dispatch({ type: 'pushPhaseChanged', phase: 'waiting' });
    try {
      while (isCurrent()) {
        await wait(interval, signal);
        if (!isCurrent()) return;
        if (now() >= deadline) return dispatch({ type: 'pushPhaseChanged', phase: 'expired' });

        const check = await requests.checkPush();
        if (!isCurrent()) return;

        switch (check) {
          case 'approved':
            dispatch({ type: 'pushPhaseChanged', phase: 'approved' });
            await wait(pushApprovedDelayMs, signal);
            if (isCurrent()) await withBusy(() => goToNextStep(MFA_STEP.challenge));
            return;
          case 'denied':
          case 'expired':
            return dispatch({ type: 'pushPhaseChanged', phase: check });
          case 'another-factor':
            await withBusy(loadFirstStep);
            return;
          case 'unsupported':
            return dispatch({ type: 'pushUnsupported' });
          case 'stopped':
            return;
          case 'slow-down':
            interval += SLOW_DOWN_STEP_MS;
            failures = 0;
            break;
          case 'failed':
            failures += 1;
            if (failures >= MAX_PUSH_CHECK_FAILURES) return blockFlow('unavailable');
            break;
          case 'pending':
            failures = 0;
            break;
        }
      }
    } catch (err) {
      if (isCurrent()) blockFlow('unexpected', err);
    }
  };

  const withBusy = async (action: () => Promise<unknown>) => {
    dispatch({ type: 'actionStarted' });
    try {
      await action();
    } finally {
      dispatch({ type: 'actionEnded' });
    }
  };

  const runUserAction = async (action: () => Promise<void>) => {
    const { isBusy, status } = getState();
    if (isBusy || status !== 'active') return;
    await withBusy(action);
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

  const loadFirstStep = async () => {
    const loaded = await requests.resolveOptions();
    if (isFinal(getState())) return;
    if (!loaded) return blockFlow('unavailable');
    if (loaded.length === 0) return blockFlow('no_authenticators');

    dispatch({ type: 'optionsLoaded', options: loaded });
    await goToNextStep(undefined);
  };

  const start = async () => {
    if (isFinal(getState())) return;
    if (!mfaError?.mfa_token) {
      return blockFlow('unexpected', new Error('MFA step-up: the error carries no mfa_token'));
    }

    await withBusy(loadFirstStep);
  };

  return {
    start: () => (startPromise ??= start()),

    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,

    next,

    back: () => {
      if (!canGoBack(getState())) return;
      stopPolling();
      dispatch({ type: 'wentBack' });
    },

    chooseAnotherFactor: () => {
      if (!canChooseAnotherFactor(getState())) return;
      stopPolling();
      dispatch({ type: 'wentToList' });
    },

    resend: () =>
      runUserAction(async () => {
        const state = getState();
        if (!isChallenged(state, state.current)) return;
        const sent = await requests.ensureChallenge(true);
        if (sent && canPollPush()) void pollPush();
      }),

    switchToCode: () => {
      const state = getState();
      if (!isPushChallenge() || isFinal(state) || state.isBusy || isVerified(state)) return;
      stopPolling();
      dispatch({ type: 'pushModeChanged', mode: 'code' });
    },

    switchToPush: () =>
      runUserAction(async () => {
        if (!isPushChallenge() || !getState().pushSupported) return;
        dispatch({ type: 'pushModeChanged', mode: 'push' });
        await requests.ensureChallenge(true);
        if (canPollPush()) void pollPush();
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
