import { describe, expect, it } from 'vitest';

import {
  canLeavePage,
  EXIT_CONDITION_POLICY,
  getExitConditionPolicy,
  getInstructionsLocale,
  isExitConditionMet,
  isPageVisible,
  resolveVisiblePages,
  type InstructionsEntryContext,
  type InstructionsExitState,
} from '../instructions-flow';

const noFacts: InstructionsEntryContext = { hasMappings: false, groupProvisioningEnabled: false };
const allFacts: InstructionsEntryContext = { hasMappings: true, groupProvisioningEnabled: true };
const notCreated: InstructionsExitState = {
  connectionExists: false,
  googleWorkspaceSetupComplete: false,
};
const done: InstructionsExitState = { connectionExists: true, googleWorkspaceSetupComplete: true };

describe('entry conditions', () => {
  it('shows pages without a condition', () => {
    expect(isPageVisible({ key: 'a' }, noFacts)).toBe(true);
  });

  it('shows if_mapping_present pages only when mappings exist', () => {
    const page = { key: 'mapping', entry_condition: 'if_mapping_present' };

    expect(isPageVisible(page, noFacts)).toBe(false);
    expect(isPageVisible(page, { ...noFacts, hasMappings: true })).toBe(true);
  });

  it('shows if_group_provisioning_enabled pages only when group provisioning is on', () => {
    const page = { key: 'groups', entry_condition: 'if_group_provisioning_enabled' };

    expect(isPageVisible(page, noFacts)).toBe(false);
    expect(isPageVisible(page, { ...noFacts, groupProvisioningEnabled: true })).toBe(true);
  });

  it('shows pages with an unknown condition', () => {
    expect(isPageVisible({ key: 'x', entry_condition: 'if_future_thing' }, noFacts)).toBe(true);
  });

  it('keeps the order of visible pages', () => {
    const pages = [
      { key: 'create' },
      { key: 'mapping', entry_condition: 'if_mapping_present' },
      { key: 'test' },
    ];

    expect(resolveVisiblePages(pages, noFacts).map((page) => page.key)).toEqual(['create', 'test']);
    expect(resolveVisiblePages(pages, allFacts).map((page) => page.key)).toEqual([
      'create',
      'mapping',
      'test',
    ]);
  });
});

describe('exit conditions', () => {
  it('blocks on connection_exists and google_workspace_setup_complete', () => {
    expect(EXIT_CONDITION_POLICY.connection_exists).toBe('blocking');
    expect(EXIT_CONDITION_POLICY.google_workspace_setup_complete).toBe('blocking');
  });

  it('only suggests testing and token generation', () => {
    expect(EXIT_CONDITION_POLICY.connection_testing_suggested).toBe('suggested');
    expect(EXIT_CONDITION_POLICY.token_generation_suggested).toBe('suggested');
  });

  it('has no policy for pages without, or with an unknown, exit condition', () => {
    expect(getExitConditionPolicy({ key: 'a' })).toBeUndefined();
    expect(getExitConditionPolicy({ key: 'a', exit_condition: 'future_thing' })).toBeUndefined();
  });

  it('requires the provider to exist to leave a connection_exists page', () => {
    const page = { key: 'configure', exit_condition: 'connection_exists' };

    expect(isExitConditionMet(page, notCreated)).toBe(false);
    expect(canLeavePage(page, notCreated)).toBe(false);
    expect(canLeavePage(page, { ...notCreated, connectionExists: true })).toBe(true);
  });

  it('requires Google Workspace setup to leave a google_workspace_setup_complete page', () => {
    const page = { key: 'grant', exit_condition: 'google_workspace_setup_complete' };

    expect(canLeavePage(page, notCreated)).toBe(false);
    expect(canLeavePage(page, { ...notCreated, googleWorkspaceSetupComplete: true })).toBe(true);
  });

  it('lets suggested and unknown conditions be left at any time', () => {
    expect(
      canLeavePage({ key: 't', exit_condition: 'connection_testing_suggested' }, notCreated),
    ).toBe(true);
    expect(
      canLeavePage({ key: 's', exit_condition: 'token_generation_suggested' }, notCreated),
    ).toBe(true);
    expect(canLeavePage({ key: 'u', exit_condition: 'future_thing' }, notCreated)).toBe(true);
    expect(canLeavePage({ key: 'plain' }, done)).toBe(true);
  });
});

describe('getInstructionsLocale', () => {
  it.each([
    ['en', 'en'],
    ['en-US', 'en'],
    ['EN_gb', 'en'],
    ['fr-FR', 'en'],
    ['ja', 'en'],
    [undefined, 'en'],
    ['', 'en'],
  ])('maps %s to %s', (appLocale, expected) => {
    expect(getInstructionsLocale(appLocale)).toBe(expected);
  });
});
