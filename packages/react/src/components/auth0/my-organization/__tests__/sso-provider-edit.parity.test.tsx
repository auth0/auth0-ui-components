import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderEdit } from '@/components/auth0/my-organization/sso-provider-edit.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockIdentityProvider } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { createMockSsoProviderEditProps } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-edit/sso-provider-edit.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { SsoProviderEditProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

/**
 * Layout-parity guard.
 *
 * `SsoProviderEdit.Root` + `SsoProviderEdit.DefaultLayout` must reproduce the
 * Tier-1 (`<SsoProviderEdit {...props} />`) anatomy: header (honoring
 * `hideHeader`) with the enable/disable toggle SWITCH, and the tabbed editor
 * body (single tablist + its tabs). This test renders both paths with identical
 * props and asserts the layout invariants match, so regressions like a
 * `hideHeader` drift in `DefaultLayout` (a header rendered when it should have
 * been gated) fail here.
 *
 * It intentionally compares structural invariants rather than byte-identical
 * DOM. In composition the header is owned by the `Header` part while `Content`
 * renders the view with its header suppressed (`hideHeader` forced true); the
 * Tier-1 view renders the header inline. Both funnel through the shared
 * {@link Header} with the same `switch` action, so the invariant counts match
 * even though the render trees are assembled differently.
 *
 * The enable/disable toggle is a SWITCH (not a button). The a11y fix gave it an
 * `aria-label` (a translated key in tests, e.g. `header.enable_provider_...`),
 * so the header toggle is queryable by accessible name and distinguishable from
 * any switches inside the tabs. `headerSwitches` counts exactly that control.
 */

mockToast();
const { initMockCoreClient } = mockCore();

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  headings: number;
  /** All switches in the subtree (header toggle plus any inside the tabs). */
  switches: number;
  /** The header enable/disable toggle specifically, by its aria-label. */
  headerSwitches: number;
  tablists: number;
  tabs: number;
  /** Whether the header wrapper keeps its `mb-8` spacing (when a header renders). */
  headerHasSpacing: boolean;
}

/** The header toggle's accessible name is the enable/disable tooltip key. */
const HEADER_TOGGLE_NAME = /header\.(enable|disable)_provider/i;

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  const headerSwitches = scope.queryAllByRole('switch', { name: HEADER_TOGGLE_NAME });
  return {
    headings: scope.queryAllByRole('heading').length,
    switches: scope.queryAllByRole('switch').length,
    headerSwitches: headerSwitches.length,
    tablists: scope.queryAllByRole('tablist').length,
    tabs: scope.queryAllByRole('tab').length,
    headerHasSpacing: headerSwitches.some((s) => s.closest('.mb-8') != null),
  };
};

describe('SsoProviderEdit — Tier-1 vs DefaultLayout parity', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const organizationApi = mockCoreClient.getMyOrganizationApiClient().organization;
    Object.defineProperty(organizationApi, 'domains', {
      value: {
        getAll: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(organizationApi, 'identityProviders', {
      value: {
        ...organizationApi.identityProviders,
        get: vi.fn().mockResolvedValue(mockProvider),
        update: vi.fn().mockResolvedValue(mockProvider),
        delete: vi.fn().mockResolvedValue({}),
      },
      writable: true,
      configurable: true,
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: SsoProviderEditProps) => {
    const { container } = renderWithProviders(<SsoProviderEdit {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: SsoProviderEditProps) => {
    const { container } = renderWithProviders(
      <SsoProviderEdit.Root {...props}>
        <SsoProviderEdit.DefaultLayout />
      </SsoProviderEdit.Root>,
    );
    return container;
  };

  const waitForLoad = async () =>
    waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

  it('matches the Tier-1 anatomy with a header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createMockSsoProviderEditProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createMockSsoProviderEditProps({ hideHeader: false }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: the header renders exactly one
    // enable/disable toggle switch (with its aria-label and mb-8 spacing) and a
    // single tabbed body.
    expect(tier1Shape.headerSwitches).toBe(1);
    expect(tier1Shape.headerHasSpacing).toBe(true);
    expect(tier1Shape.tablists).toBe(1);
    expect(tier1Shape.headings).toBeGreaterThan(0);
    // DefaultLayout must reproduce the full fingerprint exactly.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createMockSsoProviderEditProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createMockSsoProviderEditProps({ hideHeader: true }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The header (and thus its enable/disable toggle) must be gone in the Tier-1
    // path, while the tabbed body remains...
    expect(tier1Shape.headerSwitches).toBe(0);
    expect(tier1Shape.headerHasSpacing).toBe(false);
    expect(tier1Shape.tablists).toBe(1);
    // ...and DefaultLayout must honor hideHeader identically (the regression).
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createMockSsoProviderEditProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createMockSsoProviderEditProps({ hideHeader: true }));
    await waitForLoad();

    const shownShape = shapeOf(shown);
    const hiddenShape = shapeOf(hidden);

    // Only the header (its labeled toggle switch + spacing) is affected...
    expect(shownShape.headerSwitches).toBe(1);
    expect(hiddenShape.headerSwitches).toBe(0);
    expect(shownShape.headerHasSpacing).toBe(true);
    expect(hiddenShape.headerHasSpacing).toBe(false);
    // ...the editor body is unchanged by hideHeader.
    expect(hiddenShape.tablists).toBe(shownShape.tablists);
    expect(hiddenShape.tabs).toBe(shownShape.tabs);
  });
});
