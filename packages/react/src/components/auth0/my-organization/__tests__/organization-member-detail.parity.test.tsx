import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationMemberDetail } from '@/components/auth0/my-organization/organization-member-detail.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockMember,
  createMockAvailableRoles,
  createMockOrganizationMemberDetailProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationMemberDetailProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Layout-parity guard.
 *
 * `OrganizationMemberDetail.Root` + `OrganizationMemberDetail.DefaultLayout` must
 * reproduce the Tier-1 (`<OrganizationMemberDetail {...props} />`) anatomy: the
 * avatar/back-button header (honoring `hideHeader`) followed by the tabs content
 * body. This test renders both paths with identical props and asserts the layout
 * invariants match, so a regression like `hideHeader` drift in `DefaultLayout`
 * (a header rendered when it should have been gated, or vice versa) fails here.
 *
 * It intentionally compares structural invariants rather than byte-identical DOM.
 *
 * Anatomy adaptation vs the SsoProviderTable template: this component has no
 * shared title/description header, no refresh region, and no header create
 * action (see the composable module's HURDLE note). Its header is the
 * data-driven avatar/back header, so the header signal is keyed on the back
 * button (`role="button"`, name `member.detail.back_button` — unique to the
 * header) plus the member-name `h1`. The content region is the Radix tabs
 * (one `tablist`, two `tab`s). The content also contributes one heading of its
 * own, so a header-shown layout carries two headings total.
 *
 * The Tier-1 container destructures and forwards `hideHeader` to the view, so
 * both paths honor it identically.
 */

mockToast();
const { initMockCoreClient } = mockCore();

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  /** Total headings — the header contributes the member-name `h1`. */
  headings: number;
  /** Header signal: the avatar/back header's back button (unique to the header). */
  backButtons: number;
  /** Header signal: heading named after the member. */
  memberHeadings: number;
  /** Content region: Radix `TabsList`. */
  tabLists: number;
  /** Content region: Radix `TabsTrigger`s (details + roles). */
  tabs: number;
}

const mockMember = createMockMember();

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  return {
    headings: scope.queryAllByRole('heading').length,
    backButtons: scope.queryAllByRole('button', { name: /member\.detail\.back_button/i }).length,
    memberHeadings: scope.queryAllByRole('heading', { name: mockMember.name! }).length,
    tabLists: scope.queryAllByRole('tablist').length,
    tabs: scope.queryAllByRole('tab').length,
  };
};

describe('OrganizationMemberDetail — Tier-1 vs DefaultLayout parity', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockCoreClient = initMockCoreClient();
    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockMember);
    (apiService.organization.configuration.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed_strategies: ['samlp', 'oidc'],
      connection_deletion_behavior: 'allow',
      allowed_roles: createMockAvailableRoles(),
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: OrganizationMemberDetailProps) => {
    const { container } = renderWithProviders(<OrganizationMemberDetail {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: OrganizationMemberDetailProps) => {
    const { container } = renderWithProviders(
      <OrganizationMemberDetail.Root {...props}>
        <OrganizationMemberDetail.DefaultLayout />
      </OrganizationMemberDetail.Root>,
    );
    return container;
  };

  // The tabs body renders regardless of `hideHeader`, so it is the stable
  // load signal for both the header-shown and header-gated scenarios.
  const waitForLoad = async () =>
    waitFor(() =>
      expect(screen.queryAllByText('member.detail.tabs.details').length).toBeGreaterThan(0),
    );

  it('reproduces the Tier-1 anatomy exactly when the header is shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createMockOrganizationMemberDetailProps({ hideHeader: false }));
    const composed = renderDefaultLayout(
      createMockOrganizationMemberDetailProps({ hideHeader: false }),
    );
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: header present (one back button,
    // one member-name heading) plus the content region (one tablist, two tabs).
    // Total headings is two: the header's member-name h1 plus the content's own.
    expect(tier1Shape).toEqual({
      headings: 2,
      backButtons: 1,
      memberHeadings: 1,
      tabLists: 1,
      tabs: 2,
    });
    // DefaultLayout must reproduce the Tier-1 anatomy exactly.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createMockOrganizationMemberDetailProps({ hideHeader: true }));
    const composed = renderDefaultLayout(
      createMockOrganizationMemberDetailProps({ hideHeader: true }),
    );
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Both paths gate the header: no back button, no member-name heading.
    expect(tier1Shape.backButtons).toBe(0);
    expect(tier1Shape.memberHeadings).toBe(0);
    expect(tier1Shape.tabLists).toBe(1);
    expect(tier1Shape.tabs).toBe(2);

    // DefaultLayout must reproduce the Tier-1 fingerprint exactly.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(
      createMockOrganizationMemberDetailProps({ hideHeader: false }),
    );
    const hidden = renderDefaultLayout(
      createMockOrganizationMemberDetailProps({ hideHeader: true }),
    );
    await waitForLoad();

    const shownShape = shapeOf(shown);
    const hiddenShape = shapeOf(hidden);

    // Header parts appear only when hideHeader is false...
    expect(shownShape.backButtons).toBe(1);
    expect(hiddenShape.backButtons).toBe(0);
    // ...and the content region is identical either way.
    expect(shownShape.tabs).toBe(hiddenShape.tabs);
    expect(shownShape.tabLists).toBe(hiddenShape.tabLists);
  });
});
