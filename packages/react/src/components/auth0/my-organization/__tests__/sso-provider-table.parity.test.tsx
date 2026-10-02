import { idpConfigQueryKeys } from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderTable } from '@/components/auth0/my-organization/sso-provider-table.composable';
import * as useConfigModule from '@/hooks/my-organization/shared/services/use-config-service';
import * as useIdpConfigModule from '@/hooks/my-organization/shared/services/use-idp-config-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createMockIdentityProvider } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { createTestQueryClient, renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { SsoProviderTableProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/**
 * Layout-parity guard.
 *
 * `SsoProviderTable.Root` + `SsoProviderTable.DefaultLayout` must reproduce the
 * Tier-1 (`<SsoProviderTable {...props} />`) anatomy: header (honoring
 * `hideHeader`), refresh region, single table, and create action. This test
 * renders both paths with identical props and asserts the layout invariants
 * match, so regressions like the historical `hideHeader` drift in
 * `DefaultLayout` (a header rendered when it should have been gated) fail here.
 *
 * It intentionally compares structural invariants rather than byte-identical
 * DOM: the compound header action (`CreateAction` + `PermissionDeniedTooltip`)
 * and the Tier-1 `Header actions={[...]}` path build the trigger differently by
 * design, so an innerHTML diff would flag intended differences as failures.
 */

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (overrides?: Partial<SsoProviderTableProps>): SsoProviderTableProps => ({
  customMessages: {},
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly: false,
  createAction: { disabled: false, onBefore: vi.fn(() => true), onAfter: vi.fn() },
  editAction: { disabled: false, onBefore: vi.fn(() => true), onAfter: vi.fn() },
  deleteAction: undefined,
  deleteFromOrganizationAction: {},
  enableProviderAction: undefined,
  ...overrides,
});

const createMockIdpConfig = () => ({
  organization: {
    can_set_show_as_button: true,
    can_set_assign_membership_on_login: true,
  },
  strategies: {
    adfs: { enabled_features: [], provisioning_methods: [] },
    googleapps: { enabled_features: [], provisioning_methods: [] },
    oidc: { enabled_features: [], provisioning_methods: [] },
    okta: { enabled_features: [], provisioning_methods: [] },
    pingfederate: { enabled_features: [], provisioning_methods: [] },
    samlp: { enabled_features: [], provisioning_methods: [] },
    waad: { enabled_features: [], provisioning_methods: [] },
  },
});

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  headings: number;
  tables: number;
  refreshRegions: number;
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
    // RefreshIndicator renders a `role="status"` region.
    refreshRegions: scope.queryAllByRole('status').length,
    createButtons: scope.queryAllByRole('button', { name: /create/i }).length,
    headerHasSpacing: headings.some((h) => h.closest('.mb-8') != null),
  };
};

describe('SsoProviderTable — Tier-1 vs DefaultLayout parity', () => {
  const mockProvider = createMockIdentityProvider();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(idpConfigQueryKeys.config(), createMockIdpConfig());

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.identityProviders.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      identity_providers: [mockProvider],
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(createMockUseConfig());
    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(createMockUseIdpConfig());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: SsoProviderTableProps) => {
    const { container } = renderWithProviders(<SsoProviderTable {...props} />, { queryClient });
    return container;
  };

  const renderDefaultLayout = (props: SsoProviderTableProps) => {
    const { container } = renderWithProviders(
      <SsoProviderTable.Root {...props}>
        <SsoProviderTable.DefaultLayout />
      </SsoProviderTable.Root>,
      { queryClient },
    );
    return container;
  };

  const waitForLoad = async () =>
    waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

  it('matches the Tier-1 anatomy with a header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createProps({ hideHeader: false }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline expectations for the Tier-1 path: one header heading, one table,
    // one refresh region, one create action, spacing preserved.
    expect(tier1Shape).toEqual({
      headings: 1,
      tables: 1,
      refreshRegions: 1,
      createButtons: 1,
      headerHasSpacing: true,
    });
    // DefaultLayout must reproduce it exactly.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForLoad();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The header (and its create action) must be gone in the Tier-1 path...
    expect(tier1Shape.headings).toBe(0);
    expect(tier1Shape.createButtons).toBe(0);
    expect(tier1Shape.tables).toBe(1);
    // ...and DefaultLayout must honor hideHeader identically (the regression).
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForLoad();

    expect(shapeOf(shown).headings).toBe(1);
    expect(shapeOf(hidden).headings).toBe(0);
  });
});
