/**
 * The default MFA step-up flow, and how `hide` and `add` change it.
 *
 * A flow is an ordered list of steps. Each step knows when it applies: the QR step, for example,
 * applies when the user enrolls OTP or push. After a step the machine shows the next step in the
 * list that is visible, so hiding a step skips it. Added steps run last, unless placed `before`
 * or `after` another step.
 * @module mfa-step-up-flow
 */
import { FACTOR_TYPE_OTP, FACTOR_TYPE_PUSH } from '../mfa-step-up-api-constants';
import { requiresContactInput } from '../mfa-step-up-api-utils';

import type {
  MfaCustomStep,
  MfaFlowCondition,
  MfaFlowConfig,
  MfaFlowStep,
} from './mfa-step-up-flow-types';

/** Paths of the built-in steps. Use these instead of string literals so a typo cannot go unnoticed. */
export const MFA_STEP = {
  list: 'list',
  install: 'enroll.install',
  contact: 'enroll.contact',
  qr: 'enroll.qr',
  verify: 'enroll.verify',
  recovery: 'enroll.recovery',
  confirm: 'challenge.confirm',
  challenge: 'challenge',
  newRecoveryCode: 'challenge.newRecoveryCode',
} as const;

/** The steps an integrator can hide. The others are needed for the flow to work. */
export const OPTIONAL_STEPS = [MFA_STEP.install, MFA_STEP.recovery, MFA_STEP.confirm] as const;

export type MfaBuiltInStepPath = (typeof MFA_STEP)[keyof typeof MFA_STEP];
export type MfaOptionalStepPath = (typeof OPTIONAL_STEPS)[number];

const OPTIONAL_PATHS: readonly string[] = OPTIONAL_STEPS;
const BUILT_IN_PATHS: readonly string[] = Object.values(MFA_STEP);

const flowError = (message: string) => new Error(`MFA flow: ${message}`);

const assertOptionalSteps = (paths: readonly string[]) => {
  const required = paths.find((path) => !OPTIONAL_PATHS.includes(path));
  if (required) throw flowError(`"${required}" cannot be hidden`);
};

const assertValidAddedSteps = (steps: MfaCustomStep[]) => {
  const seen = new Set(BUILT_IN_PATHS);

  for (const { id, before, after } of steps) {
    if (!id) throw flowError('an added step needs an id');
    if (seen.has(id)) throw flowError(`duplicate step id "${id}"`);
    if (before !== undefined && after !== undefined) {
      throw flowError(`"${id}" cannot set both "before" and "after"`);
    }

    const anchor = before ?? after;
    if (anchor !== undefined && !seen.has(anchor)) {
      throw flowError(`"${id}" references unknown step "${anchor}"`);
    }

    seen.add(id);
  }
};

const whenEnrolling =
  (appliesWhen: MfaFlowCondition): MfaFlowCondition =>
  (facts) =>
    facts.mode === 'enroll' && appliesWhen(facts);

// In the order the user goes through them.
const BUILT_IN_STEPS: Array<{ path: MfaBuiltInStepPath; appliesWhen: MfaFlowCondition }> = [
  { path: MFA_STEP.list, appliesWhen: () => true },
  {
    path: MFA_STEP.install,
    appliesWhen: whenEnrolling((facts) => facts.factor === FACTOR_TYPE_PUSH),
  },
  {
    path: MFA_STEP.contact,
    appliesWhen: whenEnrolling((facts) => requiresContactInput(facts.factor)),
  },
  {
    path: MFA_STEP.qr,
    appliesWhen: whenEnrolling(
      (facts) => facts.factor === FACTOR_TYPE_OTP || facts.factor === FACTOR_TYPE_PUSH,
    ),
  },
  {
    path: MFA_STEP.verify,
    appliesWhen: whenEnrolling((facts) => facts.factor !== FACTOR_TYPE_PUSH),
  },
  {
    path: MFA_STEP.recovery,
    appliesWhen: whenEnrolling((facts) => facts.enrollment.hasRecoveryCodes),
  },
  { path: MFA_STEP.confirm, appliesWhen: (facts) => facts.mode === 'challenge' },
  { path: MFA_STEP.challenge, appliesWhen: (facts) => facts.mode === 'challenge' },
  {
    path: MFA_STEP.newRecoveryCode,
    appliesWhen: (facts) => facts.mode === 'challenge' && facts.hasNewRecoveryCode,
  },
];

const hasPickedOption: MfaFlowCondition = (facts) => facts.mode !== undefined;

const toHiddenWhen = (hide: boolean | MfaFlowCondition | undefined): MfaFlowCondition =>
  typeof hide === 'function' ? hide : () => hide === true;

interface FlowEntry {
  appliesWhen: MfaFlowCondition;
  isVisible: MfaFlowCondition;
}

const orderPaths = (builtInPaths: string[], addedSteps: MfaCustomStep[]): string[] => {
  const idsPlacedNextTo = (path: string, side: 'before' | 'after') =>
    addedSteps.filter((step) => step[side] === path).map((step) => step.id);

  const withPlacedSteps = (path: string): string[] => [
    ...idsPlacedNextTo(path, 'before').flatMap(withPlacedSteps),
    path,
    ...idsPlacedNextTo(path, 'after').flatMap(withPlacedSteps),
  ];

  const unplacedIds = addedSteps
    .filter((step) => !step.before && !step.after)
    .map((step) => step.id);
  return [...builtInPaths, ...unplacedIds].flatMap(withPlacedSteps);
};

/**
 * Builds the ordered list of steps from the default flow and the configuration.
 *
 * @param config - `hide`, `add` and `skipListForSingleOption`.
 * @returns The steps in order.
 * @throws When the configuration is invalid.
 */
export function createMfaFlow({
  add = [],
  hide = {},
  skipListForSingleOption = false,
}: MfaFlowConfig = {}): MfaFlowStep[] {
  assertOptionalSteps(
    Object.entries(hide)
      .filter(([, rule]) => rule)
      .map(([path]) => path),
  );
  assertValidAddedSteps(add);

  const hideRules: Partial<Record<MfaBuiltInStepPath, boolean | MfaFlowCondition>> = hide;
  const isHiddenWhen = (path: MfaBuiltInStepPath): MfaFlowCondition =>
    path === MFA_STEP.list
      ? (facts) => skipListForSingleOption && facts.optionCount === 1
      : toHiddenWhen(hideRules[path]);

  const entries = new Map<string, FlowEntry>();

  for (const { path, appliesWhen } of BUILT_IN_STEPS) {
    const isHidden = isHiddenWhen(path);
    entries.set(path, {
      appliesWhen,
      isVisible: (facts) => appliesWhen(facts) && !isHidden(facts),
    });
  }

  for (const { id, when = () => true, before, after } of add) {
    const anchor = before ?? after;
    const appliesWhen = anchor === undefined ? hasPickedOption : entries.get(anchor)!.appliesWhen;
    entries.set(id, { appliesWhen, isVisible: (facts) => appliesWhen(facts) && when(facts) });
  }

  const builtInPaths = BUILT_IN_STEPS.map(({ path }) => path);
  return orderPaths(builtInPaths, add).map((path) => ({
    path,
    isVisible: entries.get(path)!.isVisible,
  }));
}
