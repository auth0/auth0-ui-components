import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { DomainTable } from '@/components/auth0/my-organization/domain-table.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockDomain,
  createMockVerifiedDomain,
  createMockDomainTableProps,
} from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { DomainTableProps } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * Layout-parity guard.
 *
 * `DomainTable.Root` + `DomainTable.DefaultLayout` must reproduce the Tier-1
 * (`<DomainTable {...props} />`) anatomy: header (honoring `hideHeader`),
 * refresh region, single table, and create action. This test renders both
 * paths with identical props and asserts the layout invariants match, so
 * regressions like the historical `hideHeader` drift in `DefaultLayout` (a
 * header rendered when it should have been gated) fail here.
 *
 * It intentionally compares structural invariants rather than byte-identical
 * DOM: the compound header action (`CreateAction` + `PermissionDeniedTooltip`)
 * and the Tier-1 `Header actions={[...]}` path build the trigger differently by
 * design, so an innerHTML diff would flag intended differences as failures.
 */

mockToast();
const { initMockCoreClient } = mockCore();

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  headings: number;
  tables: number;
  refreshControls: number;
  createButtons: number;
  /** Whether the header wrapper keeps its `mb-8` spacing (when a header renders). */
  headerHasSpacing: boolean;
}

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  const headings = scope.queryAllByRole('heading');
  return {
    headings: headings.length,
    tables: scope.queryAllByRole('table').length,
    // Count the refresh control by its button rather than `role="status"`:
    // DataPagination also emits `role="status"`, so a bare status count would
    // conflate the movable Refresh part with the pagination live region.
    refreshControls: scope.queryAllByRole('button', { name: /refresh/i }).length,
    createButtons: scope.queryAllByRole('button', { name: /create/i }).length,
    // The shared Header wrapper carries `mb-8` spacing when it renders.
    headerHasSpacing: headings.some((h) => h.closest('.mb-8') != null),
  };
};

describe('DomainTable — Tier-1 vs DefaultLayout parity', () => {
  const mockDomain = createMockDomain();
  const mockVerifiedDomain = createMockVerifiedDomain();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      response: { organization_domains: [mockDomain, mockVerifiedDomain] },
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: DomainTableProps) => {
    const { container } = renderWithProviders(<DomainTable {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: DomainTableProps) => {
    const { container } = renderWithProviders(
      <DomainTable.Root {...props}>
        <DomainTable.DefaultLayout />
      </DomainTable.Root>,
    );
    return container;
  };

  const waitForLoad = async () =>
    waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

  it('matches the Tier-1 anatomy with a header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createMockDomainTableProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createMockDomainTableProps({ hideHeader: false }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: one header heading, one table,
    // one refresh control, one create action, spacing preserved.
    expect(tier1Shape).toEqual({
      headings: 1,
      tables: 1,
      refreshControls: 1,
      createButtons: 1,
      headerHasSpacing: true,
    });
    // DefaultLayout must reproduce it exactly.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createMockDomainTableProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createMockDomainTableProps({ hideHeader: true }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The header (and its create action) must be gone in the Tier-1 path...
    expect(tier1Shape.headings).toBe(0);
    expect(tier1Shape.createButtons).toBe(0);
    expect(tier1Shape.tables).toBe(1);
    // ...while the movable refresh control still renders.
    expect(tier1Shape.refreshControls).toBe(1);
    // ...and DefaultLayout must honor hideHeader identically (the regression).
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createMockDomainTableProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createMockDomainTableProps({ hideHeader: true }));
    await waitForLoad();

    expect(shapeOf(shown).headings).toBe(1);
    expect(shapeOf(hidden).headings).toBe(0);
  });
});
