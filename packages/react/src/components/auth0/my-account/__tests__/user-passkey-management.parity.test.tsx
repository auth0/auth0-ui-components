import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserPasskeyManagement } from '@/components/auth0/my-account/user-passkey-management.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UserPasskeyManagementProps } from '@/types/my-account/user-passkey-management/user-passkey-management-types';

/**
 * Layout-parity guard.
 *
 * `UserPasskeyManagement.Root` + `UserPasskeyManagement.DefaultLayout` must
 * reproduce the Tier-1 (`<UserPasskeyManagement {...props} />`) anatomy: a
 * section header (honoring `hideHeader`), the passkey content card, and — the
 * critical invariant for this component — a SINGLE add-passkey control.
 *
 * The native Add control lives INSIDE the passkey card (as a `CardAction`), not
 * in the header. `DefaultLayout` therefore renders it via `Content` exactly the
 * way Tier-1 does. This test renders both paths with identical props and asserts
 * the layout invariants match, so a regression that duplicated the add control
 * (e.g. a header-hosted Add plus the in-card Add) or drifted on `hideHeader`
 * would fail here.
 *
 * It intentionally compares structural invariants rather than byte-identical
 * DOM: the wrapping order and context providers differ between the tiers by
 * design, so an innerHTML diff would flag intended differences as failures.
 */

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (
  overrides?: Partial<UserPasskeyManagementProps>,
): UserPasskeyManagementProps => ({
  customMessages: {},
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  ...overrides,
});

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  headings: number;
  /** Card regions (`data-slot="card"`) — the content region. Empty state = 1. */
  cards: number;
  /** The add-passkey trigger count. MUST be 1 (never duplicated). */
  addButtons: number;
  /** Whether the header wrapper keeps its `mb-8` spacing (when a header renders). */
  headerHasSpacing: boolean;
}

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  const headings = scope.queryAllByRole('heading');
  return {
    headings: headings.length,
    cards: container.querySelectorAll('[data-slot="card"]').length,
    // The in-card Add button is labelled with `t('add_passkey')`.
    addButtons: scope.queryAllByRole('button', { name: 'add_passkey' }).length,
    headerHasSpacing: headings.some((h) => h.closest('.mb-8') != null),
  };
};

describe('UserPasskeyManagement — Tier-1 vs DefaultLayout parity', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    // Deterministic empty state: one content card, add control visible, no
    // revoke dropdowns — the cleanest anatomy for a structural comparison.
    mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
      .fn()
      .mockResolvedValue({ authentication_methods: [] });
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: UserPasskeyManagementProps) => {
    const { container } = renderWithProviders(<UserPasskeyManagement {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: UserPasskeyManagementProps) => {
    const { container } = renderWithProviders(
      <UserPasskeyManagement.Root {...props}>
        <UserPasskeyManagement.DefaultLayout />
      </UserPasskeyManagement.Root>,
    );
    return container;
  };

  // Both instances render into the document; wait until both have resolved to
  // their empty state (the `no_passkeys` copy is present once per instance).
  const waitForBothLoaded = async () =>
    waitFor(() => expect(screen.getAllByText('no_passkeys')).toHaveLength(2));

  it('matches the Tier-1 anatomy with a header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createProps({ hideHeader: false }));
    await waitForBothLoaded();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: one header heading, one content
    // card, exactly one add control, header spacing preserved.
    expect(tier1Shape).toEqual({
      headings: 1,
      cards: 1,
      addButtons: 1,
      headerHasSpacing: true,
    });
    // DefaultLayout must reproduce it exactly — including the SINGLE add control.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForBothLoaded();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The section header must be gone in the Tier-1 path, but the content card
    // and its single add control remain.
    expect(tier1Shape.headings).toBe(0);
    expect(tier1Shape.cards).toBe(1);
    expect(tier1Shape.addButtons).toBe(1);
    // ...and DefaultLayout must honor hideHeader identically.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForBothLoaded();

    expect(shapeOf(shown).headings).toBe(1);
    expect(shapeOf(hidden).headings).toBe(0);
    // The add control is unaffected by the header toggle: still exactly one each.
    expect(shapeOf(shown).addButtons).toBe(1);
    expect(shapeOf(hidden).addButtons).toBe(1);
  });
});
