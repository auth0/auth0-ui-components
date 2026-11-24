import { describe, expect, it, vi } from 'vitest';

import {
  canGoBack,
  createInitialState,
  getChallengeKey,
  getEnrollKey,
  isChallenged,
  reduce,
  toSnapshot,
  type StepUpEvent,
  type StepUpState,
} from '../mfa-step-up-state';
import { createStepUpStore } from '../mfa-step-up-state';

const run = (events: StepUpEvent[], state: StepUpState = createInitialState({ mfaToken: 'tok' })) =>
  events.reduce(reduce, state);

const option = { id: 'enroll:sms', kind: 'enroll' as const, factor: 'sms' };

describe('reduce', () => {
  it('enters a step and remembers the one it left', () => {
    const state = run([
      { type: 'stepEntered', path: 'list' },
      { type: 'stepEntered', path: 'enroll.contact' },
    ]);

    expect(state).toMatchObject({
      status: 'active',
      current: 'enroll.contact',
      history: ['list'],
    });
  });

  it('goes back one step', () => {
    const state = run([
      { type: 'stepEntered', path: 'list' },
      { type: 'stepEntered', path: 'enroll.contact' },
      { type: 'wentBack' },
    ]);

    expect(state).toMatchObject({ current: 'list', history: [] });
  });

  it('forgets the pick and the contact when it goes back to the list', () => {
    const state = run([
      { type: 'optionsLoaded', options: [option] },
      { type: 'stepEntered', path: 'list' },
      { type: 'optionSelected', option },
      { type: 'contactEntered', contact: '+14155550123' },
      { type: 'stepEntered', path: 'enroll.contact' },
      { type: 'wentBack' },
    ]);

    expect(state).toMatchObject({ current: 'list', selected: undefined, contact: '' });
  });

  it('keeps the contact when it goes back to another step', () => {
    const state = run([
      { type: 'stepEntered', path: 'enroll.contact' },
      { type: 'contactEntered', contact: '+14155550123' },
      { type: 'stepEntered', path: 'enroll.verify' },
      { type: 'wentBack' },
    ]);

    expect(state.contact).toBe('+14155550123');
  });

  it('keeps results by key', () => {
    const response = { authenticatorType: 'otp' as const, secret: 's', barcodeUri: 'u' };
    const state = run([{ type: 'enrolled', key: 'otp|', response }]);

    expect(state.enrollments).toEqual({ 'otp|': response });
  });

  it.each(['done', 'blocked', 'cancelled'] as const)(
    'ignores every event once the flow is %s',
    (status) => {
      const ended = run([{ type: 'flowEnded', status }]);

      expect(reduce(ended, { type: 'stepEntered', path: 'list' })).toBe(ended);
      expect(reduce(ended, { type: 'contactEntered', contact: 'a@b.com' })).toBe(ended);
      expect(reduce(ended, { type: 'verified' })).toBe(ended);
    },
  );

  it('keeps the error of the last request when the flow ends', () => {
    const error = new Error('boom');
    const state = run([
      { type: 'requestStarted', name: 'enroll' },
      { type: 'requestFailed', name: 'enroll', error },
      { type: 'flowEnded', status: 'blocked', reason: 'token_expired' },
    ]);

    expect(state.request).toEqual({ name: 'enroll', isLoading: false, error });
  });
});

describe('push', () => {
  const pushOption = {
    id: 'challenge:push-1',
    kind: 'challenge' as const,
    factor: 'push',
    authenticator: { id: 'push-1', authenticatorType: 'oob' as const },
  };
  const onPushChallenge = (): StepUpEvent[] => [
    { type: 'optionsLoaded', options: [pushOption] },
    { type: 'optionSelected', option: pushOption },
    { type: 'stepEntered', path: 'challenge' },
  ];

  it('is in the snapshot only on the challenge step of a push authenticator', () => {
    expect(toSnapshot(run(onPushChallenge())).push).toEqual({
      mode: 'push',
      phase: 'waiting',
      canApprove: true,
    });
    expect(toSnapshot(run([{ type: 'stepEntered', path: 'list' }])).push).toBeUndefined();
  });

  it('changes phase, and ignores a phase it is already in', () => {
    const state = run([...onPushChallenge(), { type: 'pushPhaseChanged', phase: 'denied' }]);

    expect(toSnapshot(state).push?.phase).toBe('denied');
    expect(reduce(state, { type: 'pushPhaseChanged', phase: 'denied' })).toBe(state);
  });

  it('starts waiting again whenever the mode changes', () => {
    const state = run([
      ...onPushChallenge(),
      { type: 'pushPhaseChanged', phase: 'expired' },
      { type: 'pushModeChanged', mode: 'code' },
    ]);

    expect(toSnapshot(state).push).toEqual({
      mode: 'code',
      phase: 'waiting',
      canApprove: true,
    });
  });

  it('stops offering the push once the backend showed it cannot check one, and shows the code', () => {
    const state = run([...onPushChallenge(), { type: 'pushUnsupported' }]);

    expect(toSnapshot(state).push).toEqual({
      mode: 'code',
      phase: 'waiting',
      canApprove: false,
    });
  });

  it('is also in the snapshot on the confirm step, before anything is sent', () => {
    const state = run([
      { type: 'optionsLoaded', options: [pushOption] },
      { type: 'optionSelected', option: pushOption },
      { type: 'stepEntered', path: 'challenge.confirm' },
    ]);

    expect(toSnapshot(state).push).toMatchObject({ canApprove: true });
  });

  it('starts in code mode, and stays there, when a push cannot be approved here', () => {
    const initial = createInitialState({ mfaToken: 'tok', pushSupported: false });
    const state = run(onPushChallenge(), initial);

    expect(toSnapshot(state).push).toEqual({ mode: 'code', phase: 'waiting', canApprove: false });
    expect(isChallenged(state, 'challenge')).toBe(false);
    expect(run([{ type: 'stepEntered', path: 'challenge' }], state)).toMatchObject({
      pushMode: 'code',
    });
  });

  it('keeps that across a new round', () => {
    const state = run(
      [{ type: 'roundStarted', mfaToken: 'next' }],
      createInitialState({ mfaToken: 'tok', pushSupported: false }),
    );

    expect(state).toMatchObject({ pushSupported: false, pushMode: 'code' });
  });

  it('starts over when a step is entered', () => {
    const answered = run([
      ...onPushChallenge(),
      { type: 'pushModeChanged', mode: 'code' },
      { type: 'pushPhaseChanged', phase: 'denied' },
    ]);

    expect(run([{ type: 'stepEntered', path: 'challenge' }], answered)).toMatchObject({
      pushMode: 'push',
      pushPhase: 'waiting',
    });
  });

  it('starts over when the user goes to the list', () => {
    const other = { id: 'challenge:otp-1', kind: 'challenge' as const, factor: 'otp' };
    const state = run([
      { type: 'optionsLoaded', options: [pushOption, other] },
      { type: 'stepEntered', path: 'list' },
      { type: 'optionSelected', option: pushOption },
      { type: 'stepEntered', path: 'challenge' },
      { type: 'pushPhaseChanged', phase: 'denied' },
      { type: 'wentToList' },
    ]);

    expect(state).toMatchObject({ current: 'list', pushMode: 'push', pushPhase: 'waiting' });
  });
});

describe('events that change nothing', () => {
  it.each([
    [
      'a second verified event',
      [{ type: 'verified' }] as StepUpEvent[],
      { type: 'verified' } as StepUpEvent,
    ],
    [
      'starting an action while one runs',
      [{ type: 'actionStarted' }] as StepUpEvent[],
      { type: 'actionStarted' } as StepUpEvent,
    ],
    [
      'ending an action that is not running',
      [] as StepUpEvent[],
      { type: 'actionEnded' } as StepUpEvent,
    ],
    [
      'entering the same contact',
      [{ type: 'contactEntered', contact: 'a@b.com' }] as StepUpEvent[],
      { type: 'contactEntered', contact: 'a@b.com' } as StepUpEvent,
    ],
  ])('return the same state for %s', (_name, before, event) => {
    const state = run(before);
    expect(reduce(state, event)).toBe(state);
  });

  it('keeps the original depth when the user is verified again', () => {
    const state = run([
      { type: 'stepEntered', path: 'enroll.verify' },
      { type: 'verified' },
      { type: 'stepEntered', path: 'consent' },
    ]);
    expect(reduce(state, { type: 'verified' }).verifiedAtDepth).toBe(1);
  });
});

describe('wentBack', () => {
  it('does nothing without a step to go back to', () => {
    const state = run([{ type: 'stepEntered', path: 'list' }]);
    expect(reduce(state, { type: 'wentBack' })).toBe(state);
  });

  it('does nothing while an action is running', () => {
    const state = run([
      { type: 'stepEntered', path: 'list' },
      { type: 'stepEntered', path: 'enroll.contact' },
      { type: 'actionStarted' },
    ]);
    expect(reduce(state, { type: 'wentBack' })).toBe(state);
  });
});

describe('wentToList', () => {
  const two = [option, { id: 'enroll:email', kind: 'enroll' as const, factor: 'email' }];
  const onSecondStep = () =>
    run([
      { type: 'optionsLoaded', options: two },
      { type: 'stepEntered', path: 'list' },
      { type: 'optionSelected', option },
      { type: 'contactEntered', contact: '+14155550123' },
      { type: 'stepEntered', path: 'enroll.contact' },
      { type: 'stepEntered', path: 'enroll.verify' },
    ]);

  it('jumps over every step back to the list, and forgets the pick and the contact', () => {
    const state = reduce(onSecondStep(), { type: 'wentToList' });

    expect(state).toMatchObject({ current: 'list', history: [], selected: undefined, contact: '' });
  });

  it.each([
    [
      'there is only one option',
      run([
        { type: 'optionsLoaded', options: [option] },
        { type: 'stepEntered', path: 'list' },
        { type: 'stepEntered', path: 'enroll.contact' },
      ]),
    ],
    [
      'the list was never shown',
      run([
        { type: 'optionsLoaded', options: two },
        { type: 'stepEntered', path: 'enroll.contact' },
      ]),
    ],
    ['the user is verified', run([{ type: 'verified' }], onSecondStep())],
    ['an action is running', run([{ type: 'actionStarted' }], onSecondStep())],
  ])('does nothing when %s', (_name, state) => {
    expect(reduce(state, { type: 'wentToList' })).toBe(state);
  });
});

describe('optionSelected', () => {
  it('forgets the contact when a different option is picked', () => {
    const email = { id: 'enroll:email', kind: 'enroll' as const, factor: 'email' };
    const state = run([
      { type: 'optionsLoaded', options: [option, email] },
      { type: 'optionSelected', option },
      { type: 'contactEntered', contact: '+14155550123' },
      { type: 'optionSelected', option: email },
    ]);

    expect(state).toMatchObject({ selected: email, contact: '' });
  });

  it('keeps the contact when the same option is picked again', () => {
    const state = run([
      { type: 'optionsLoaded', options: [option] },
      { type: 'optionSelected', option },
      { type: 'contactEntered', contact: '+14155550123' },
    ]);

    expect(reduce(state, { type: 'optionSelected', option })).toBe(state);
  });

  it('accepts an option that is available, and clears the pick', () => {
    const state = run([
      { type: 'optionsLoaded', options: [option] },
      { type: 'optionSelected', option },
    ]);
    expect(state.selected).toEqual(option);
    expect(reduce(state, { type: 'optionSelected' }).selected).toBeUndefined();
  });

  it('ignores an option that is not available', () => {
    const state = run([{ type: 'optionsLoaded', options: [] }]);
    expect(reduce(state, { type: 'optionSelected', option })).toBe(state);
  });
});

describe('flowEnded', () => {
  it('is not busy once the flow has ended mid-action', () => {
    const state = run([{ type: 'actionStarted' }, { type: 'flowEnded', status: 'cancelled' }]);
    expect(state.isBusy).toBe(false);
  });

  it('stores the error it was given, and keeps the last request error when it has none', () => {
    const failed = new Error('request');
    const thrown = new Error('condition');
    const afterRequest = run([
      { type: 'requestFailed', name: 'enroll', error: failed },
      { type: 'flowEnded', status: 'blocked', reason: 'unavailable' },
    ]);
    expect(afterRequest.request.error).toBe(failed);

    const afterCondition = run([
      { type: 'flowEnded', status: 'blocked', reason: 'unexpected', error: thrown },
    ]);
    expect(afterCondition.request.error).toBe(thrown);
  });
});

describe('cache keys', () => {
  const withContact = (factor: string, contact: string) =>
    run([
      { type: 'optionsLoaded', options: [{ id: `enroll:${factor}`, kind: 'enroll', factor }] },
      { type: 'optionSelected', option: { id: `enroll:${factor}`, kind: 'enroll', factor } },
      { type: 'contactEntered', contact },
    ]);

  it('gives a contact factor a new enroll and challenge key for a new contact', () => {
    const first = withContact('sms', '+14155550123');
    const second = withContact('sms', '+14155550199');

    expect(getEnrollKey(first)).not.toBe(getEnrollKey(second));
    expect(getChallengeKey(first)).not.toBe(getChallengeKey(second));
  });

  it('ignores the contact for a factor that does not use one', () => {
    expect(getEnrollKey(withContact('otp', 'a'))).toBe(getEnrollKey(withContact('otp', 'b')));
  });
});

describe('canGoBack after the user is verified', () => {
  // verify, recovery, then two added steps
  const steps = ['enroll.verify', 'enroll.recovery', 'consent', 'survey'];
  const enterAll = steps.map((path): StepUpEvent => ({ type: 'stepEntered', path }));
  const verifiedAfterVerify: StepUpEvent[] = [
    enterAll[0]!,
    { type: 'verified' },
    ...enterAll.slice(1),
  ];

  const canGoBackFrom = (depth: number) =>
    canGoBack(run([{ type: 'stepEntered', path: 'list' }, ...verifiedAfterVerify.slice(0, depth)]));

  it('cannot return to a step entered before the user was verified', () => {
    // On recovery, the step before it is the verify step.
    expect(canGoBackFrom(3)).toBe(false);
  });

  it('can return to steps entered after the user was verified', () => {
    // On consent the step before it is recovery, and on survey it is consent.
    expect(canGoBackFrom(4)).toBe(true);
    expect(canGoBackFrom(5)).toBe(true);
  });
});

describe('canGoBack', () => {
  const afterTwoSteps = run([
    { type: 'stepEntered', path: 'list' },
    { type: 'stepEntered', path: 'enroll.contact' },
  ]);

  it('is true when there is a step to go back to', () => {
    expect(canGoBack(afterTwoSteps)).toBe(true);
  });

  it.each([
    ['there is no history', run([{ type: 'stepEntered', path: 'list' }])],
    ['an action is running', run([{ type: 'actionStarted' }], afterTwoSteps)],
    ['the user was verified', run([{ type: 'verified' }], afterTwoSteps)],
    ['the flow ended', run([{ type: 'flowEnded', status: 'done' }], afterTwoSteps)],
  ])('is false when %s', (_name, state) => {
    expect(canGoBack(state)).toBe(false);
  });
});

describe('createStepUpStore', () => {
  it('rebuilds the snapshot and notifies when an event changes the state', () => {
    const store = createStepUpStore({ mfaToken: 'tok' });
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getSnapshot();

    store.dispatch({ type: 'stepEntered', path: 'list' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).not.toBe(before);
    expect(store.getSnapshot().step).toBe('list');
  });

  it('notifies nobody when a push event leaves the state as it was', () => {
    const store = createStepUpStore({ mfaToken: 'tok', pushSupported: false });
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'pushUnsupported' });
    store.dispatch({ type: 'pushModeChanged', mode: 'code' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying a subscriber that unsubscribed', () => {
    const store = createStepUpStore({ mfaToken: 'tok' });
    const listener = vi.fn();
    store.subscribe(listener)();

    store.dispatch({ type: 'stepEntered', path: 'list' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('does not call a subscriber that another one removed during the same notification', () => {
    const store = createStepUpStore({ mfaToken: 'tok' });
    const removed = vi.fn();
    let unsubscribeSecond = () => {};
    store.subscribe(() => unsubscribeSecond());
    unsubscribeSecond = store.subscribe(removed);

    store.dispatch({ type: 'stepEntered', path: 'list' });

    expect(removed).not.toHaveBeenCalled();
  });

  it('tells the other subscribers when one throws', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStepUpStore({ mfaToken: 'tok' });
    const heard = vi.fn();
    store.subscribe(() => {
      throw new Error('subscriber bug');
    });
    store.subscribe(heard);

    store.dispatch({ type: 'stepEntered', path: 'list' });

    expect(heard).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('subscriber'), expect.any(Error));
    warn.mockRestore();
  });

  it('keeps the same snapshot and notifies nobody when nothing changes', () => {
    const store = createStepUpStore({ mfaToken: 'tok' });
    store.dispatch({ type: 'flowEnded', status: 'cancelled', reason: 'user' });
    const listener = vi.fn();
    store.subscribe(listener);
    const snapshot = store.getSnapshot();

    store.dispatch({ type: 'verified' });

    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(snapshot);
  });
});
