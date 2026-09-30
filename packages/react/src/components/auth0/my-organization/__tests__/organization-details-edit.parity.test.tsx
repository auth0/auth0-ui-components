import { within, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationDetailsEdit } from '@/components/auth0/my-organization/organization-details-edit.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationDetailsEditProps } from '@/types/my-organization/organization-management/organization-details-edit-types';

/**
 * Layout-parity guard for the `organization-details-edit` composable.
 *
 * `OrganizationDetailsEdit.Root` + `OrganizationDetailsEdit.DefaultLayout` must
 * reproduce the Tier-1 (`<OrganizationDetailsEdit {...props} />`) anatomy: a
 * header block (title + optional back button) and a single edit form with its
 * fields and the Save (submit) / Cancel form actions. Both paths are rendered
 * with identical props and their structural invariants are compared.
 *
 * PRIMARY GUARD — header `mb-8` spacing (checklist #3). The composable `Header`
 * part wraps its `Header` in `cn('mb-8', className)` to mirror the Tier-1 view's
 * `<div className="mb-8">` header wrapper (base view `:114-115`). This test pins
 * that the header title heading sits inside an `mb-8` spacing wrapper in BOTH
 * paths, using the same `heading.closest('.mb-8')` technique as the
 * SsoProviderTable pilot — but targeted at the header heading specifically
 * (`header.title`) rather than any heading, since the form body also renders
 * section headings inside their own `mb-8` content wrapper.
 *
 * It compares structural invariants, not byte-identical DOM: Tier-1 renders the
 * header inside the view's `w-full` wrapper while the composable renders it as a
 * standalone `Header` part, so an innerHTML diff would flag intended, cosmetic
 * differences as failures.
 */

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (
  overrides?: Partial<OrganizationDetailsEditProps>,
): OrganizationDetailsEditProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  hideHeader: false,
  saveAction: undefined,
  cancelAction: undefined,
  backButton: undefined,
  ...overrides,
});

/** Structural fingerprint of a rendered layout — the invariants that must match. */
interface LayoutShape {
  /** Header title headings (`header.title`) — the composable/view `Header` block. */
  headerHeadings: number;
  /** Editable form fields (display name, name, etc.). */
  textboxes: number;
  /** Number of `<form>` regions — exactly one edit form in the default anatomy. */
  forms: number;
  submitButtons: number;
  /** Whether every rendered header heading sits inside an `mb-8` wrapper (checklist #3). */
  headerHasSpacing: boolean;
}

const shapeOf = (container: HTMLElement): LayoutShape => {
  const scope = within(container);
  // The header title heading is the `Header` part's `<h2>` (`t('header.title')`);
  // form-body section headings (`sections.*.title`) render as separate `<h3>`s.
  const headerHeadings = scope.queryAllByRole('heading', { name: /header\.title/i });
  return {
    headerHeadings: headerHeadings.length,
    textboxes: scope.queryAllByRole('textbox').length,
    forms: container.querySelectorAll('form').length,
    submitButtons: scope.queryAllByRole('button', { name: /submit_button_label/i }).length,
    headerHasSpacing:
      headerHeadings.length > 0 && headerHeadings.every((h) => h.closest('.mb-8') != null),
  };
};

/** The header-independent invariants — identical across paths regardless of `hideHeader`. */
const formShapeOf = (shape: LayoutShape) => ({
  textboxes: shape.textboxes,
  forms: shape.forms,
  submitButtons: shape.submitButtons,
});

describe('OrganizationDetailsEdit — Tier-1 vs DefaultLayout parity', () => {
  const mockOrganization = createMockOrganization();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockCoreClient = initMockCoreClient();
    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderTier1 = (props: OrganizationDetailsEditProps) => {
    const { container } = renderWithProviders(<OrganizationDetailsEdit {...props} />);
    return container;
  };

  const renderDefaultLayout = (props: OrganizationDetailsEditProps) => {
    const { container } = renderWithProviders(
      <OrganizationDetailsEdit.Root {...props}>
        <OrganizationDetailsEdit.DefaultLayout />
      </OrganizationDetailsEdit.Root>,
    );
    return container;
  };

  // Both paths render past the GateKeeper spinner once the org loads; the display
  // name input then carries the mocked value. Rendering both means two inputs.
  const waitForBothLoaded = async () =>
    waitFor(() =>
      expect(screen.getAllByDisplayValue('Auth0 Corporation').length).toBeGreaterThanOrEqual(2),
    );

  it('reproduces the Tier-1 anatomy in DefaultLayout with the header shown (hideHeader: false)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: false }));
    const composed = renderDefaultLayout(createProps({ hideHeader: false }));
    await waitForBothLoaded();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Tier-1 baseline: one header title heading with `mb-8` spacing, a single form
    // with its fields and the Save (submit) action.
    expect(tier1Shape.headerHeadings).toBe(1);
    expect(tier1Shape.forms).toBe(1);
    expect(tier1Shape.submitButtons).toBe(1);
    expect(tier1Shape.textboxes).toBeGreaterThanOrEqual(1);
    expect(tier1Shape.headerHasSpacing).toBe(true);

    // DefaultLayout must reproduce the Tier-1 fingerprint exactly — INCLUDING the
    // header `mb-8` spacing (checklist #3, the historical regression this guards).
    expect(composedShape).toEqual(tier1Shape);
    expect(composedShape.headerHasSpacing).toBe(true);
  });

  it('honors hideHeader in the Tier-1 path (header gated, form unchanged)', async () => {
    const shown = renderTier1(createProps({ hideHeader: false }));
    const hidden = renderTier1(createProps({ hideHeader: true }));
    await waitForBothLoaded();

    const shownShape = shapeOf(shown);
    const hiddenShape = shapeOf(hidden);

    // Tier-1 gates the header on `hideHeader` (base view `:114`)...
    expect(shownShape.headerHeadings).toBe(1);
    expect(hiddenShape.headerHeadings).toBe(0);
    // ...while the form region (fields + submit) is identical either way.
    expect(formShapeOf(hiddenShape)).toEqual(formShapeOf(shownShape));
  });

  it('matches the Tier-1 anatomy with the header gated (hideHeader: true)', async () => {
    const tier1 = renderTier1(createProps({ hideHeader: true }));
    const composed = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForBothLoaded();

    const tier1Shape = shapeOf(tier1);
    const composedShape = shapeOf(composed);

    // Tier-1 gates the header; form region stays intact.
    expect(tier1Shape.headerHeadings).toBe(0);
    expect(tier1Shape.headerHasSpacing).toBe(false);
    expect(tier1Shape.forms).toBe(1);
    expect(tier1Shape.submitButtons).toBe(1);

    // DefaultLayout must honor hideHeader identically (fixed: previously rendered
    // the header unconditionally, ignoring hideHeader).
    expect(composedShape).toEqual(tier1Shape);
  });

  it('toggles the header purely on hideHeader in DefaultLayout', async () => {
    const shown = renderDefaultLayout(createProps({ hideHeader: false }));
    const hidden = renderDefaultLayout(createProps({ hideHeader: true }));
    await waitForBothLoaded();

    expect(shapeOf(shown).headerHeadings).toBe(1);
    expect(shapeOf(shown).headerHasSpacing).toBe(true);
    expect(shapeOf(hidden).headerHeadings).toBe(0);
    // Form region is identical either way.
    expect(formShapeOf(shapeOf(shown))).toEqual(formShapeOf(shapeOf(hidden)));
  });
});
