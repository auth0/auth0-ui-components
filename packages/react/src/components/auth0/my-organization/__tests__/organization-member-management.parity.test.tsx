import { within, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationMemberManagement } from '@/components/auth0/my-organization/organization-member-management.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockPendingInvitation } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import {
  createMockMember,
  createMockRoleOptions,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationMemberManagementProps } from '@/types/my-organization/member-management/organization-member-management-types';

/**
 * Layout-parity guard.
 *
 * `OrganizationMemberManagement.Root` + `OrganizationMemberManagement.DefaultLayout`
 * is meant to reproduce the Tier-1 (`<OrganizationMemberManagement {...props} />`)
 * anatomy: header (honoring `hideHeader`), the members/invitations tabs, the
 * refresh control, a single (active-tab) table, and the invite action. This test
 * renders both paths with identical props and asserts the layout invariants
 * match, so drift between the callable Tier-1 path and the composed layout is
 * caught here.
 *
 * It intentionally compares structural invariants rather than byte-identical
 * DOM: the Tier-1 header builds the invite trigger via `Header actions={[...]}`
 * while the composed `Header` part builds it via `actionSlot={<InviteAction />}`,
 * so an innerHTML diff would flag intended differences as failures.
 */

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (
  overrides?: Partial<OrganizationMemberManagementProps>,
): OrganizationMemberManagementProps => ({
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  hideHeader: false,
  readOnly: false,
  ...overrides,
});

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  headings: number;
  tabs: number;
  tables: number;
  refreshControls: number;
  inviteButtons: number;
}

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  return {
    // The section header emits a single (h2) heading.
    headings: scope.queryAllByRole('heading').length,
    // TabsList renders one `tab` per members/invitations trigger.
    tabs: scope.queryAllByRole('tab').length,
    // Only the active tab's content mounts, so a healthy layout has one table.
    tables: scope.queryAllByRole('table').length,
    // The RefreshIndicator's manual-refresh button. Queried by role/name rather
    // than the `role="status"` region because the app also renders a global
    // sr-only "Content loaded." status announcer that would inflate the count.
    refreshControls: scope.queryAllByRole('button', { name: /refresh/i }).length,
    inviteButtons: scope.queryAllByRole('button', { name: /invite_button/i }).length,
  };
};

describe('OrganizationMemberManagement — Tier-1 vs DefaultLayout parity', () => {
  const mockMember = createMockMember();
  const mockInvitation = createMockPendingInvitation();
  const mockRoles = createMockRoleOptions();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.members.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockMember],
      response: { next: null, total: 1 },
    });
    (apiService.organization.invitations.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockInvitation],
      response: { next: null },
    });
    (apiService.organization.roles.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockRoles,
      response: { next: null },
    });
    (apiService.organization.configuration.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed_strategies: ['samlp', 'oidc'],
      connection_deletion_behavior: 'allow',
      allowed_roles: mockRoles,
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: OrganizationMemberManagementProps) => {
    const { container } = renderWithProviders(<OrganizationMemberManagement {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: OrganizationMemberManagementProps) => {
    const { container } = renderWithProviders(
      <OrganizationMemberManagement.Root {...props}>
        <OrganizationMemberManagement.DefaultLayout />
      </OrganizationMemberManagement.Root>,
    );
    return container;
  };

  // Both paths finish their initial load once the members tab trigger appears.
  const waitForLoad = async () => screen.findAllByRole('tab', { name: /tabs\.members/i });

  it('matches the Tier-1 anatomy with a header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createProps({ hideHeader: false }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: one header heading, the two
    // tabs, one active-tab table, one refresh control, one invite action.
    expect(tier1Shape).toEqual({
      headings: 1,
      tabs: 2,
      tables: 1,
      refreshControls: 1,
      inviteButtons: 1,
    });
    // Header must actually be present (not merely a matching count).
    expect(within(tier1).getByRole('heading', { name: /header\.title/i })).toBeInTheDocument();
    // DefaultLayout must reproduce it exactly when the header is shown.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The Tier-1 path gates its header (and the invite action lives in it) while
    // keeping the tab/table/refresh body intact.
    expect(tier1Shape.headings).toBe(0);
    expect(tier1Shape.inviteButtons).toBe(0);
    expect(tier1Shape.tabs).toBe(2);
    expect(tier1Shape.tables).toBe(1);
    expect(tier1Shape.refreshControls).toBe(1);

    // DefaultLayout must honor hideHeader identically — the header (and its
    // invite action) are gated in both paths, body unchanged.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForLoad();

    expect(shapeOf(shown).headings).toBe(1);
    expect(shapeOf(shown).inviteButtons).toBe(1);
    expect(shapeOf(hidden).headings).toBe(0);
    expect(shapeOf(hidden).inviteButtons).toBe(0);
  });

  it('shows the DefaultLayout header when hideHeader is false', async () => {
    const shown = renderDefaultLayout(createProps({ hideHeader: false }));
    await waitForLoad();

    expect(shapeOf(shown).headings).toBe(1);
    expect(within(shown).getByRole('heading', { name: /header\.title/i })).toBeInTheDocument();
  });
});
