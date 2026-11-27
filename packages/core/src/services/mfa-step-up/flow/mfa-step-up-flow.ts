/**
 * The default MFA step-up flow, and how `hide` and `add` change it.
 *
 * A flow is an ordered list of steps. Each step knows when it applies: the QR step, for example,
 * applies when the user enrolls OTP or push. After a step the machine shows the next step in the
 * list that is visible, so hiding a step skips it. Added steps run last, unless placed `before`
 * or `after` another step.
 * @module mfa-step-up-flow
 */
import {
  BUILT_IN_STEPS,
  flowError,
  hasPickedOption,
  MFA_STEP,
  OPTIONAL_STEP_PATHS,
} from './mfa-step-up-flow-constants';
import type {
  AddedStep,
  BuiltInStep,
  HideRules,
  MfaCustomStep,
  MfaFlowCondition,
  MfaFlowConfig,
  MfaFlowStep,
} from './mfa-step-up-flow-types';

/**
 * @param hide - What the integrator hides.
 * @param add - The steps the integrator adds.
 * @throws When a step that cannot be hidden is hidden, or an added step has a bad id or place.
 */
function validateFlowConfig(hide: HideRules, add: MfaCustomStep[]): void {
  for (const [path, rule] of Object.entries(hide)) {
    if (rule && !OPTIONAL_STEP_PATHS.has(path)) {
      throw flowError(`"${path}" cannot be hidden`);
    }
  }

  const seen = new Set<string>(Object.values(MFA_STEP));

  for (const { id, before, after } of add) {
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
}

/**
 * @param builtInStep - The built-in step.
 * @param config - What the integrator hides, and whether to skip the list for a single option.
 * @returns When the step is shown.
 */
function getBuiltInVisibility(
  { path, appliesWhen }: BuiltInStep,
  { hide, skipListForSingleOption }: { hide: HideRules; skipListForSingleOption: boolean },
): MfaFlowCondition {
  if (path === MFA_STEP.list) {
    return skipListForSingleOption ? (facts) => facts.optionCount !== 1 : appliesWhen;
  }

  const hideRule = hide[path];
  if (!hideRule) return appliesWhen;
  if (typeof hideRule === 'function') {
    return (facts) => appliesWhen(facts) && !hideRule(facts);
  }
  return () => false;
}

/**
 * Turns each added step into a step with a rule for when it is shown. An added step is shown where
 * the step it is placed next to is shown: one added before `enroll.contact` appears only when the
 * user enrolls a phone or email, because that is when `enroll.contact` applies. The step's own
 * `when` can narrow that further. A step with no place is shown once the user picked an option.
 *
 * @param add - The steps the integrator adds.
 * @returns Each added step, with the place it was given.
 */
function toAddedSteps(add: MfaCustomStep[]): AddedStep[] {
  const appliesWhenByPath = new Map<string, MfaFlowCondition>(
    BUILT_IN_STEPS.map(({ path, appliesWhen }) => [path, appliesWhen]),
  );
  const addedSteps: AddedStep[] = [];

  for (const { id, when = () => true, before, after } of add) {
    const anchor = before ?? after;
    const anchorAppliesWhen = anchor === undefined ? undefined : appliesWhenByPath.get(anchor);
    const appliesWhen = anchorAppliesWhen ?? hasPickedOption;
    const isVisible: MfaFlowCondition = (facts) => appliesWhen(facts) && when(facts);
    appliesWhenByPath.set(id, isVisible);

    const step: MfaFlowStep = { path: id, isVisible };
    addedSteps.push({ step, before, after });
  }

  return addedSteps;
}

/**
 * Walks the built-in steps in order and puts the added steps around them. For each step, the steps
 * added `before` it come first, then the step, then the steps added `after` it. An added step gets
 * the same treatment, so a step can be placed next to another added step. Steps added with no
 * place come last.
 *
 * @param builtInSteps - The built-in steps, in order.
 * @param add - The steps the integrator adds.
 * @returns All steps in the order the user goes through them.
 */
function insertAddedSteps(builtInSteps: MfaFlowStep[], add: MfaCustomStep[]): MfaFlowStep[] {
  const addedSteps = toAddedSteps(add);

  const addedBefore = (anchor: MfaFlowStep) =>
    addedSteps.filter((added) => added.before === anchor.path).map((added) => added.step);
  const addedAfter = (anchor: MfaFlowStep) =>
    addedSteps.filter((added) => added.after === anchor.path).map((added) => added.step);
  const trailingSteps = addedSteps
    .filter(({ before, after }) => before === undefined && after === undefined)
    .map(({ step }) => step);

  const orderedSteps: MfaFlowStep[] = [];

  const place = (step: MfaFlowStep) => {
    addedBefore(step).forEach(place);
    orderedSteps.push(step);
    addedAfter(step).forEach(place);
  };

  [...builtInSteps, ...trailingSteps].forEach(place);
  return orderedSteps;
}

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
  const hideRules: HideRules = hide;
  validateFlowConfig(hideRules, add);

  const builtInSteps = BUILT_IN_STEPS.map(
    (builtInStep): MfaFlowStep => ({
      path: builtInStep.path,
      isVisible: getBuiltInVisibility(builtInStep, { hide: hideRules, skipListForSingleOption }),
    }),
  );

  return insertAddedSteps(builtInSteps, add);
}
