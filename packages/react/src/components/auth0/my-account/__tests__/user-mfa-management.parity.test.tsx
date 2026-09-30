import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserMFAManagement } from '@/components/auth0/my-account/user-mfa-management.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockAuthenticator,
  createMockAuthenticationMethodsResponse,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UserMFAManagementProps } from '@/types/my-account/user-mfa-management/user-mfa-management-types';

/**
 * Layout-parity guard.
 *
 * `UserMFAManagement.Root` + `UserMFAManagement.DefaultLayout` must reproduce
 * the Tier-1 (`<UserMFAManagement {...props} />`) anatomy: a single section
 * header (honoring `hideHeader`) followed by the per-factor content (one Card +
 * enroll button per visible factor type). This test renders both paths with
 * identical props and asserts the layout invariants match, so a regression like
 * `DefaultLayout` dropping the `hideHeader` gate (a header rendered when it
 * should have been suppressed, or vice versa) fails here.
 *
 * It intentionally compares structural invariants rather than byte-identical
 * DOM. MFA has no single top-level action to host-replace (enroll is per-factor,
 * see the composable module's HURDLE note), so there is no compound-action path
 * to diff; the invariants below are the meaningful layout contract.
 *
 * Heading count: only the section `Header` emits a `heading` role (an `<h2>`,
 * `headingLevel` default 2 after the header a11y fixes). The per-factor
 * `CardTitle`s render plain `<div>`s, not headings, so `heading` count is a
 * clean proxy for "is the section header present" with no factor-card noise.
 */

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (overrides?: Partial<UserMFAManagementProps>): UserMFAManagementProps => ({
  hideHeader: false,
  showActiveOnly: false,
  disableEnroll: false,
  disableDelete: false,
  readOnly: false,
  factorConfig: {},
  ...overrides,
});

const setupEnrolledTotpFactor = (
  apiService: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>,
) => {
  apiService.authenticationMethods.list = vi
    .fn()
    .mockResolvedValue(
      createMockAuthenticationMethodsResponse([
        createMockAuthenticator({ type: 'totp', enrolled: true }),
      ]),
    );
};

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  headings: number;
  /** One Card per visible factor type (per-factor content). */
  factorCards: number;
  /** One enroll button per visible, editable factor type. */
  enrollButtons: number;
  /** Whether the header wrapper keeps its `mb-8` spacing (when a header renders). */
  headerHasSpacing: boolean;
}

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  // Only the section Header emits a `heading` role; factor CardTitles are divs.
  const headings = scope.queryAllByRole('heading');
  return {
    headings: headings.length,
    factorCards: container.querySelectorAll('[data-slot="card"]').length,
    enrollButtons: scope.queryAllByRole('button', { name: /button_text/i }).length,
    headerHasSpacing: headings.some((h) => h.closest('.mb-8') != null),
  };
};

describe('UserMFAManagement — Tier-1 vs DefaultLayout parity', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    setupEnrolledTotpFactor(mockCoreClient.getMyAccountApiClient());

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: UserMFAManagementProps) => {
    const { container } = renderWithProviders(<UserMFAManagement {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: UserMFAManagementProps) => {
    const { container } = renderWithProviders(
      <UserMFAManagement.Root {...props}>
        <UserMFAManagement.DefaultLayout />
      </UserMFAManagement.Root>,
    );
    return container;
  };

  const waitForLoad = async () =>
    waitFor(() => expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument());

  it('matches the Tier-1 anatomy with a header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createProps({ hideHeader: false }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: exactly one section heading,
    // per-factor cards + enroll buttons present, header spacing preserved.
    expect(tier1Shape.headings).toBe(1);
    expect(tier1Shape.headerHasSpacing).toBe(true);
    expect(tier1Shape.factorCards).toBeGreaterThan(0);
    expect(tier1Shape.enrollButtons).toBeGreaterThan(0);
    // Note: cards and enroll buttons are not 1:1 — some visible factor types
    // render a card without an enroll action — so we only assert both are
    // present here and rely on the full-fingerprint equality below for parity.

    // DefaultLayout must reproduce the full fingerprint exactly.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The section header must be gone in the Tier-1 path, but the factor content
    // stays intact.
    expect(tier1Shape.headings).toBe(0);
    expect(tier1Shape.headerHasSpacing).toBe(false);
    expect(tier1Shape.factorCards).toBeGreaterThan(0);
    expect(tier1Shape.enrollButtons).toBeGreaterThan(0);
    // ...and DefaultLayout must honor hideHeader identically (the regression).
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForLoad();

    const shownShape = shapeOf(shown);
    const hiddenShape = shapeOf(hidden);

    // Only the header toggles; the per-factor content is unchanged.
    expect(shownShape.headings).toBe(1);
    expect(hiddenShape.headings).toBe(0);
    expect(hiddenShape.factorCards).toBe(shownShape.factorCards);
    expect(hiddenShape.enrollButtons).toBe(shownShape.enrollButtons);
  });
});
