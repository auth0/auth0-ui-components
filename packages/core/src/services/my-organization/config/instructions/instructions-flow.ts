/**
 * Page flow rules for identity provider instructions: which pages show, and when the
 * administrator may leave a page.
 * @module instructions-flow
 * @internal
 */

import type {
  IdpInstructionsEntryCondition,
  IdpInstructionsExitCondition,
  IdpInstructionsLocale,
  IdpProvisioningInstructionsEntryCondition,
  IdpProvisioningInstructionsExitCondition,
} from '../config-types';

export type InstructionsKind = 'creation' | 'provisioning';

export type InstructionsEntryCondition =
  | IdpInstructionsEntryCondition
  | IdpProvisioningInstructionsEntryCondition;

export type InstructionsExitCondition =
  | IdpInstructionsExitCondition
  | IdpProvisioningInstructionsExitCondition;

export interface InstructionsFlowPage {
  key: string;
  entry_condition?: string;
  exit_condition?: string;
}

export interface InstructionsEntryContext {
  hasMappings: boolean;
  groupProvisioningEnabled: boolean;
}

export interface InstructionsExitState {
  connectionExists: boolean;
  googleWorkspaceSetupComplete: boolean;
}

export type ExitConditionPolicy = 'blocking' | 'suggested';

export const EXIT_CONDITION_POLICY: Record<InstructionsExitCondition, ExitConditionPolicy> = {
  connection_exists: 'blocking',
  connection_testing_suggested: 'suggested',
  token_generation_suggested: 'suggested',
  google_workspace_setup_complete: 'blocking',
};

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
 * Whether a page's entry condition allows it to be shown. Pages without a condition, or with a
 * condition this client does not know, are shown.
 * @param page - Instruction page.
 * @param context - Facts the conditions depend on.
 * @returns `true` when the page should be shown.
 */
export function isPageVisible(
  page: InstructionsFlowPage,
  context: InstructionsEntryContext,
): boolean {
  if (!page.entry_condition) return true;
  const check = ENTRY_CONDITION_CHECKS[page.entry_condition as InstructionsEntryCondition];
  return check ? check(context) : true;
}

/**
 * The pages to show, in order.
 * @param pages - Pages from the instructions response.
 * @param context - Facts the entry conditions depend on.
 * @returns Visible pages.
 */
export function resolveVisiblePages<TPage extends InstructionsFlowPage>(
  pages: readonly TPage[],
  context: InstructionsEntryContext,
): TPage[] {
  return pages.filter((page) => isPageVisible(page, context));
}

/**
 * Policy for a page's exit condition. Pages without one, or with one this client does not know,
 * never block.
 * @param page - Instruction page.
 * @returns The policy, or `undefined` when nothing is required.
 */
export function getExitConditionPolicy(
  page: InstructionsFlowPage,
): ExitConditionPolicy | undefined {
  if (!page.exit_condition) return undefined;
  return EXIT_CONDITION_POLICY[page.exit_condition as InstructionsExitCondition];
}

/**
 * Whether a page's exit condition currently holds. Suggested conditions always hold; the client
 * prompts but lets the administrator continue.
 * @param page - Instruction page.
 * @param state - Facts the conditions depend on.
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
 * @param state - Facts the exit conditions depend on.
 * @returns `true` unless a blocking exit condition is unmet.
 */
export function canLeavePage(page: InstructionsFlowPage, state: InstructionsExitState): boolean {
  return getExitConditionPolicy(page) !== 'blocking' || isExitConditionMet(page, state);
}

/**
 * Maps an application locale (e.g. `en-US`, `fr-FR`) to a locale the instructions endpoints
 * accept, falling back to `en`.
 * @param appLocale - Application locale.
 * @returns Instructions locale.
 */
export function getInstructionsLocale(appLocale: string | undefined): IdpInstructionsLocale {
  const language = appLocale?.trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.find((locale) => locale === language) ?? DEFAULT_LOCALE;
}
