/**
 * Progressive-composability layer for {@link OrganizationMemberDetail}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Content`) on top of
 * the existing container/view split, with zero breaking changes to the Tier-1
 * default usage (`<OrganizationMemberDetail {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<OrganizationMemberDetail {...props} />`
 * - Tier 3 (structural): `Root` + `Content`, sharing one model via context, so
 *   hosts can interleave their own UI around the detail.
 * - Tier 4 (headless): `useOrganizationMemberDetailModel(options)` — see index re-export.
 *
 * HURDLE — why there is no Tier-2 action part and no `Header`/`Refresh` parts:
 * Unlike the {@link SsoProviderTable} pilot, this component does NOT use the
 * shared {@link Header} with a separable action region. It renders a LOCAL,
 * name-driven avatar/back-button header inside {@link OrganizationMemberDetailView}
 * (see `Header` in `organization-member-detail.tsx`). Consequences:
 * - There is no shared-Header action slot to replace, so no `Header` part.
 * - `hideHeader` on the props type is not honored by the view, so it is not
 *   surfaced here.
 * - There is no refresh/last-updated affordance, so no `Refresh` part and no
 *   `hideRefresh`.
 * - The primary actions (remove-from-organization, assign-roles, remove-roles)
 *   are buried inside the tab subcomponents and are triggered via the model's
 *   `openModal`, not via header buttons. They cannot be cleanly decomposed into
 *   Tier-2 render-prop parts.
 * As a result this layer is intentionally headless-leaning: it offers Root/Content
 * structural wrapping (Tier 3) for interleaving host UI, and the Tier-4 model hook
 * for full control. Finer-grained composition requires the Tier-4 hook.
 *
 * @module organization-member-detail.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  OrganizationMemberDetail as OrganizationMemberDetailDefault,
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

const [OrganizationMemberDetailContext, useOrganizationMemberDetailContext] =
  createComponentContext<OrganizationMemberDetailComposition>('OrganizationMemberDetail');

const DEFAULT_STYLING: NonNullable<OrganizationMemberDetailProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

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
function Root({ children, ...props }: OrganizationMemberDetailRootProps) {
  const {
    userId,
    onBack,
    customMessages = {},
    styling = DEFAULT_STYLING,
    initialTab,
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  } = props;

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

  const composition = React.useMemo<OrganizationMemberDetailComposition>(
    () => ({ model, props: { ...props, styling, customMessages } }),
    [model, props, styling, customMessages],
  );

  return (
    <OrganizationMemberDetailContext.Provider value={composition}>
      <GateKeeper isLoading={model.isLoading} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </OrganizationMemberDetailContext.Provider>
  );
}

Root.displayName = 'OrganizationMemberDetail.Root';

/**
 * The full member detail body (local header + tabs + modals). Reuses the
 * existing view with an EXACT replication of the Tier-1 container's prop
 * pass-through (spread of the shared model plus `styling` and `customMessages`).
 *
 * The view owns its local avatar/back-button header, so `Content` renders the
 * complete detail including that header — there is no separate `Header` part
 * (see the module HURDLE note).
 * @returns The member detail content.
 */
function Content() {
  const { model, props } = useOrganizationMemberDetailContext();
  return (
    <OrganizationMemberDetailView
      {...model}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
    />
  );
}

Content.displayName = 'OrganizationMemberDetail.Content';

/**
 * The default anatomy: just the full detail content. Wrapping in
 * `Root` + `DefaultLayout` reproduces the Tier-1 visual output exactly, so hosts
 * can opt into composition incrementally.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  return <Content />;
}

DefaultLayout.displayName = 'OrganizationMemberDetail.DefaultLayout';

/**
 * Organization member detail with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<OrganizationMemberDetail {...props} />`),
 * and exposes `Root`/`Content` for structural (Tier 3) composition — interleaving
 * host UI around the detail. For fully headless (Tier 4) usage, see
 * `useOrganizationMemberDetailModel`.
 *
 * This component has no shared-Header action region and no refresh affordance,
 * so it offers no Tier-2 render-prop parts (see the module HURDLE note).
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <OrganizationMemberDetail.Root {...props}>
 *   <HostBreadcrumbs />
 *   <OrganizationMemberDetail.Content />
 * </OrganizationMemberDetail.Root>
 * ```
 */
const OrganizationMemberDetail = Object.assign(OrganizationMemberDetailDefault, {
  Root,
  DefaultLayout,
  Content,
});

export {
  OrganizationMemberDetail,
  Root,
  DefaultLayout,
  Content,
  useOrganizationMemberDetailContext,
};
