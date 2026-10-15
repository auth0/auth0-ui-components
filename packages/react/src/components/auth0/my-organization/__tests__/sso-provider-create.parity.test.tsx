import { AVAILABLE_STRATEGY_LIST, idpConfigQueryKeys } from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { within, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderCreate } from '@/components/auth0/my-organization/sso-provider-create.composable';
import * as useConfigModule from '@/hooks/my-organization/shared/services/use-config-service';
import * as useIdpConfigModule from '@/hooks/my-organization/shared/services/use-idp-config-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { createTestQueryClient, renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { SsoProviderCreateProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/**
 * Layout-parity guard — no-header wizard exception.
 *
 * `SsoProviderCreate` is the deliberate exception to the header-parity the
 * table-style components enforce: it is a multi-step *wizard* whose Next /
 * Previous / Complete chrome is owned by the shared `<Wizard>`, so there is
 * **no `Header` part and no `hideHeader` flag** — the view always renders its
 * own header (see the HURDLE note in `sso-provider-create.composable.tsx`).
 * A standalone header slot would be a hollow control with no navigation behind
 * it, so the composable offers only structural parts (`Root` / `Content` /
 * `DefaultLayout`), never a header/action/refresh part.
 *
 * Parity here therefore means: `<SsoProviderCreate.Root>` +
 * `<SsoProviderCreate.DefaultLayout />` must reproduce the Tier-1
 * (`<SsoProviderCreate {...props} />`) wizard anatomy — the always-on header
 * heading, exactly one wizard content region (no duplication), the first
 * step's strategy fields, and the optional back button — with **identical
 * props**. We compare structural invariants (equal counts), not byte-identical
 * DOM, so intentional wrapper differences between the two paths do not flag as
 * failures. There is no `hideHeader` case to assert; instead we cover default
 * props and a second meaningful variant (`backButton`), and confirm the
 * composed path never duplicates the wizard content.
 */

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (overrides?: Partial<SsoProviderCreateProps>): SsoProviderCreateProps => ({
  createAction: {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
  },
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  backButton: undefined,
  onNext: undefined,
  onPrevious: undefined,
  schema: undefined,
  ...overrides,
});

const createMockIdpConfig = () => ({
  organization: {
    can_set_show_as_button: true,
    can_set_assign_membership_on_login: true,
  },
  strategies: AVAILABLE_STRATEGY_LIST,
});

/** Structural fingerprint of a rendered wizard — the invariants that must match. */
interface WizardShape {
  /** The always-on header heading (this component has no `hideHeader`). */
  headings: number;
  /** Wizard content region(s); must be exactly 1 — parts share one model. */
  contentRegions: number;
  /** First-step strategy buttons (`ProviderSelect`). */
  strategyButtons: number;
  /** The header's optional back button (present only when `backButton` is set). */
  backButtons: number;
}

const shapeOf = (container: HTMLElement): WizardShape => {
  const scope = within(container);
  return {
    headings: scope.queryAllByRole('heading').length,
    contentRegions: scope.queryAllByTestId('sso-provider-create-content').length,
    // Strategy tiles render as left-aligned buttons in the first wizard step.
    strategyButtons: container.querySelectorAll('button[class*="justify-start"]').length,
    // Header back button carries the `mb-3` spacing class unique to it here.
    backButtons: container.querySelectorAll('button[class*="mb-3"]').length,
  };
};

describe('SsoProviderCreate — Tier-1 vs DefaultLayout parity (no-header wizard)', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(idpConfigQueryKeys.config(), createMockIdpConfig());

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue(
      createMockUseConfig({
        config: {
          connection_deletion_behavior: 'allow',
          allowed_strategies: ['adfs', 'okta', 'samlp'],
        },
        filteredStrategies: ['adfs', 'okta', 'samlp'],
      }),
    );

    vi.spyOn(useIdpConfigModule, 'useIdpConfig').mockReturnValue(createMockUseIdpConfig());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: SsoProviderCreateProps) => {
    const { container } = renderWithProviders(<SsoProviderCreate {...props} />, { queryClient });
    return container;
  };

  // Canonical "default layout" composition: Root shares one model with the
  // parts, and DefaultLayout simply renders Content.
  const renderDefaultLayout = (props: SsoProviderCreateProps) => {
    const { container } = renderWithProviders(
      <SsoProviderCreate.Root {...props}>
        <SsoProviderCreate.DefaultLayout />
      </SsoProviderCreate.Root>,
      { queryClient },
    );
    return container;
  };

  const waitForWizard = async (container: HTMLElement) =>
    waitFor(() => {
      expect(within(container).queryByTestId('sso-provider-create-content')).toBeInTheDocument();
      expect(container.querySelectorAll('button[class*="justify-start"]').length).toBeGreaterThan(
        0,
      );
    });

  it('matches the Tier-1 wizard anatomy with default props', async () => {
    const tier1 = renderTier1(createProps());
    const composed = renderDefaultLayout(createProps());
    await waitForWizard(tier1);
    await waitForWizard(composed);

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Baseline: header always renders (no hideHeader), exactly one wizard
    // content region, strategy step populated, no back button by default.
    expect(tier1Shape.headings).toBeGreaterThanOrEqual(1);
    expect(tier1Shape.contentRegions).toBe(1);
    expect(tier1Shape.strategyButtons).toBeGreaterThan(0);
    expect(tier1Shape.backButtons).toBe(0);

    // DefaultLayout must reproduce the Tier-1 shape exactly (no duplication).
    expect(composedShape).toEqual(tier1Shape);
  });

  it('matches the Tier-1 wizard anatomy with a back button (meaningful variant)', async () => {
    const tier1 = renderTier1(createProps({ backButton: { onClick: vi.fn() } }));
    const composed = renderDefaultLayout(createProps({ backButton: { onClick: vi.fn() } }));
    await waitForWizard(tier1);
    await waitForWizard(composed);

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // The back button now renders inside the (always-on) header...
    expect(tier1Shape.backButtons).toBe(1);
    expect(tier1Shape.headings).toBeGreaterThanOrEqual(1);
    expect(tier1Shape.contentRegions).toBe(1);
    // ...and DefaultLayout must honor it identically.
    expect(composedShape).toEqual(tier1Shape);
  });

  it('renders the wizard content region exactly once when interleaved with host UI', async () => {
    const { container } = renderWithProviders(
      <SsoProviderCreate.Root {...createProps()}>
        <div data-testid="host-panel">Host guidance</div>
        <SsoProviderCreate.Content />
      </SsoProviderCreate.Root>,
      { queryClient },
    );
    await waitForWizard(container);

    // Interleaving host UI must not duplicate the wizard: parts share one model.
    expect(within(container).getByTestId('host-panel')).toBeInTheDocument();
    expect(shapeOf(container).contentRegions).toBe(1);
  });
});
