/**
 * Progressive-composability layer for {@link OrganizationMemberDetail}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`, `Content`) on
 * top of the existing container/view split, with zero breaking changes to the
 * Tier-1 default usage (`<OrganizationMemberDetail {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<OrganizationMemberDetail {...props} />`
 * - Tier 3 (structural): compose `Header` / `Content` freely, sharing one model
 *   via context, so hosts can interleave their own UI around the detail.
 * - Tier 4 (headless): `useOrganizationMemberDetailModel(options)` — see index re-export.
 *
 * HURDLE — why there is no Tier-2 action part and no `Refresh` part:
 * Unlike single-action tables, this component's primary actions
 * (remove-from-organization, assign-roles, remove-roles) are buried inside the
 * tab subcomponents and are triggered via the model's `openModal`, not via
 * header buttons — they cannot be cleanly decomposed into Tier-2 render-prop
 * parts. There is also no refresh/last-updated affordance, so no `Refresh` part
 * and no `hideRefresh`. Hosts needing finer-grained control use the Tier-4 hook.
 *
 * The `Header` here is NOT the shared title/description {@link Header}: it wraps
 * the component's own name-driven avatar/back-button header
 * ({@link OrganizationMemberDetailHeader}), which the base view now renders
 * behind a `hideHeader` gate so composition can own it as a standalone part.
 *
 * @module organization-member-detail.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  OrganizationMemberDetail as OrganizationMemberDetailDefault,
  OrganizationMemberDetailHeader,
  OrganizationMemberDetailView,
} from '@/components/auth0/my-organization/organization-member-detail';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useOrganizationMemberDetail } from '@/hooks/my-organization/use-member-detail';
import { useTheme } from '@/hooks/shared/use-theme';
import { createComponentContext } from '@/lib/composability';
import type {
  OrganizationMemberDetailProps,
  UseOrganizationMemberDetailResult,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/** Value shared from `Root` to every compound part. */
interface OrganizationMemberDetailComposition {
  model: UseOrganizationMemberDetailResult;
  props: OrganizationMemberDetailProps;
}

const [OrganizationMemberDetailContext, useOrganizationMemberDetailContext, parts] =
  createComponentContext<OrganizationMemberDetailComposition>('OrganizationMemberDetail', {
    requiredParts: ['Content'],
  });

const DEFAULT_STYLING: NonNullable<OrganizationMemberDetailProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * Stable default for `customMessages`. Hoisted to module scope so an omitted
 * prop yields the same reference every render (an inline `{}` would allocate a
 * fresh object each render and defeat the composition memo + translator memo).
 */
const EMPTY_CUSTOM_MESSAGES: NonNullable<OrganizationMemberDetailProps['customMessages']> = {};

/** Props for {@link Root}. Mirrors {@link OrganizationMemberDetailProps} plus children. */
export interface OrganizationMemberDetailRootProps extends OrganizationMemberDetailProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 *
 * Mirrors the Tier-1 container exactly: the same props are destructured, the
 * same `useOrganizationMemberDetail(...)` options object is passed, and the same
 * `GateKeeper isLoading={model.isLoading}` gate is applied.
 * @param props - {@link OrganizationMemberDetailRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({
  children,
  userId,
  onBack,
  customMessages = EMPTY_CUSTOM_MESSAGES,
  styling = DEFAULT_STYLING,
  schema,
  readOnly,
  hideHeader,
  initialTab,
  removeFromOrganizationAction,
  assignRolesAction,
  removeRolesAction,
}: OrganizationMemberDetailRootProps) {
  const model = useOrganizationMemberDetail({
    userId,
    onBack,
    customMessages,
    initialTab,
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  // Key the composition on concrete prop fields, not the `props` container: a
  // rest-spread (`{ ...props }`) allocates a new object every render and would
  // defeat this memo. With `model` now memoized in the hook, the context value
  // is stable across renders unless a real input changes.
  const composition = React.useMemo<OrganizationMemberDetailComposition>(
    () => ({
      model,
      props: {
        styling,
        customMessages,
        schema,
        readOnly,
        userId,
        onBack,
        hideHeader,
        initialTab,
        removeFromOrganizationAction,
        assignRolesAction,
        removeRolesAction,
      },
    }),
    [
      model,
      styling,
      customMessages,
      schema,
      readOnly,
      userId,
      onBack,
      hideHeader,
      initialTab,
      removeFromOrganizationAction,
      assignRolesAction,
      removeRolesAction,
    ],
  );

  return (
    <OrganizationMemberDetailContext.Provider value={composition}>
      <GateKeeper isLoading={model.isLoading} styling={styling}>
        <StyledScope style={currentStyles.variables}>
          <parts.Boundary>{children}</parts.Boundary>
        </StyledScope>
      </GateKeeper>
    </OrganizationMemberDetailContext.Provider>
  );
}

Root.displayName = 'OrganizationMemberDetail.Root';

/**
 * The member's avatar/back-button header (name + user-id badge). Wraps the base
 * {@link OrganizationMemberDetailHeader}, driven entirely by the shared model, so
 * Tier-3 hosts can position it independently of the tabs body.
 *
 * This is NOT the shared title/description header used by table components —
 * it is this component's own data-driven header, so it takes no `action`/copy
 * props.
 * @returns The member detail header element.
 */
function Header() {
  const { model, props } = useOrganizationMemberDetailContext();
  return (
    <OrganizationMemberDetailHeader
      member={model.member}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      handleBack={model.handleBack}
    />
  );
}

Header.displayName = 'OrganizationMemberDetail.Header';

/**
 * The member detail body (tabs + modals). Reuses the existing view with its
 * built-in header suppressed (`hideHeader`), since the header is owned by the
 * {@link Header} part in composition. Prop pass-through otherwise mirrors the
 * Tier-1 container exactly (spread of the shared model plus `styling` and
 * `customMessages`).
 * @returns The member detail content.
 */
function Content() {
  const { model, props } = useOrganizationMemberDetailContext();
  parts.useRegisterPart('Content');
  return (
    <OrganizationMemberDetailView
      {...model}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      hideHeader
    />
  );
}

Content.displayName = 'OrganizationMemberDetail.Content';

/**
 * The default anatomy: header → content. Wrapping in `Root` + `DefaultLayout`
 * reproduces the Tier-1 visual output exactly, so hosts can opt into composition
 * incrementally. `hideHeader` suppresses the header, mirroring the Tier-1 prop.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  const { props } = useOrganizationMemberDetailContext();
  return (
    <>
      {!props.hideHeader && <Header />}
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'OrganizationMemberDetail.DefaultLayout';

/**
 * Organization member detail with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<OrganizationMemberDetail {...props} />`),
 * and exposes `Root`/`Header`/`Content` for structural (Tier 3) composition —
 * interleaving host UI around the detail. For fully headless (Tier 4) usage, see
 * `useOrganizationMemberDetailModel`.
 *
 * There is no header action region and no refresh affordance, so it offers no
 * Tier-2 render-prop parts (see the module HURDLE note).
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <OrganizationMemberDetail.Root {...props}>
 *   <OrganizationMemberDetail.Header />
 *   <HostBreadcrumbs />
 *   <OrganizationMemberDetail.Content />
 * </OrganizationMemberDetail.Root>
 * ```
 */
const OrganizationMemberDetail = Object.assign(OrganizationMemberDetailDefault, {
  Root,
  DefaultLayout,
  Header,
  Content,
});

export {
  OrganizationMemberDetail,
  Root,
  DefaultLayout,
  Header,
  Content,
  useOrganizationMemberDetailContext,
};
