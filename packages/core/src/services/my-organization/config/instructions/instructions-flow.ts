/**
 * Page flow rules for identity provider instructions.
 * @module instructions-flow
 * @internal
 */

import { EXIT_CONDITION_POLICY } from '../config-constants';

import type {
  ExitConditionPolicy,
  IdpInstructionsLocale,
  InstructionsEntryCondition,
  InstructionsEntryContext,
  InstructionsExitCondition,
  InstructionsExitState,
  InstructionsFlowPage,
} from './instructions-types';

const ENTRY_CONDITION_CHECKS: Record<
  InstructionsEntryCondition,
  (context: InstructionsEntryContext) => boolean
> = {
  if_mapping_present: (context) => context.hasMappings,
  if_group_provisioning_enabled: (context) => context.groupProvisioningEnabled,
};

const SUPPORTED_LOCALES: readonly IdpInstructionsLocale[] = ['en'];
const DEFAULT_LOCALE: IdpInstructionsLocale = 'en';

/**
 * Whether a page's entry condition allows it to be shown; unknown conditions show it.
 * @param page - Instruction page.
 * @param context - Entry condition facts.
 * @returns `true` when the page should be shown.
 */
export function isPageVisible(
  page: InstructionsFlowPage,
  context: InstructionsEntryContext,
): boolean {
  const condition = page.entry_condition;
  if (!condition || !Object.hasOwn(ENTRY_CONDITION_CHECKS, condition)) return true;
  return ENTRY_CONDITION_CHECKS[condition as InstructionsEntryCondition](context);
}

/**
 * The pages to show, in order.
 * @param pages - Instruction pages.
 * @param context - Entry condition facts.
 * @returns Visible pages.
 */
export function resolveVisiblePages<TPage extends InstructionsFlowPage>(
  pages: readonly TPage[],
  context: InstructionsEntryContext,
): TPage[] {
  return pages.filter((page) => isPageVisible(page, context));
}

/**
 * Policy for a page's exit condition; unknown conditions never block.
 * @param page - Instruction page.
 * @returns The policy, or `undefined` when there is none.
 */
export function getExitConditionPolicy(
  page: InstructionsFlowPage,
): ExitConditionPolicy | undefined {
  const condition = page.exit_condition;
  if (!condition || !Object.hasOwn(EXIT_CONDITION_POLICY, condition)) return undefined;
  return EXIT_CONDITION_POLICY[condition as InstructionsExitCondition];
}

/**
 * Whether a page's exit condition holds; suggested conditions always hold.
 * @param page - Instruction page.
 * @param state - Exit condition facts.
 * @returns `true` when the condition holds or there is none.
 */
export function isExitConditionMet(
  page: InstructionsFlowPage,
  state: InstructionsExitState,
): boolean {
  switch (page.exit_condition) {
    case 'connection_exists':
      return state.connectionExists;
    case 'google_workspace_setup_complete':
      return state.googleWorkspaceSetupComplete;
    default:
      return true;
  }
}

/**
 * Whether the administrator may move past a page.
 * @param page - Instruction page.
 * @param state - Exit condition facts.
 * @returns `true` unless a blocking condition is unmet.
 */
export function canLeavePage(page: InstructionsFlowPage, state: InstructionsExitState): boolean {
  return getExitConditionPolicy(page) !== 'blocking' || isExitConditionMet(page, state);
}

/**
 * Maps an application locale to a supported instructions locale, falling back to `en`.
 * @param appLocale - Application locale.
 * @returns Instructions locale.
 */
export function getInstructionsLocale(appLocale: string | undefined): IdpInstructionsLocale {
  const language = appLocale?.trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.find((locale) => locale === language) ?? DEFAULT_LOCALE;
}
