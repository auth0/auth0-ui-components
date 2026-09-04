/**
 * Progressive-composability layer for {@link SsoProviderCreate}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Content`) on top of
 * the existing container/view split, with zero breaking changes to the Tier-1
 * default usage (`<SsoProviderCreate {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<SsoProviderCreate {...props} />`
 * - Tier 3 (structural): compose `Content` freely, interleaving host UI around
 *     the wizard (`<Root>` shares one model with `<Content>` via context).
 * - Tier 4 (headless): `useSsoProviderCreateModel(options)` — see index re-export.
 *
 * ## HURDLE — why this layer is headless-leaning (no action/header parts)
 *
 * Unlike the {@link SsoProviderTable} pilot, `SsoProviderCreate` is
 * **wizard-driven**, which changes what can honestly be offered as composable
 * parts:
 *
 * 1. **No host-replaceable action part.** The Next / Previous / Complete
 *    controls are owned by the shared `<Wizard>` component and the per-step
 *    `createStepActions(...)` factory — not exposed as a single, standalone
 *    button we could wire a host element into (as `CreateAction` does for the
 *    table). Navigation and submission are internal to the wizard step model,
 *    so there is **no Tier-2 action part** here.
 * 2. **No `Header` part / no `hideHeader`.** The view always renders its own
 *    `<Header>` (title + optional back button) and exposes no `hideHeader` flag,
 *    so the header cannot be lifted out or suppressed independently. Header copy
 *    stays inside `Content`.
 * 3. **No `RefreshIndicator`.** This is a creation wizard, not a data table —
 *    there is no stale/refetch surface, hence no `Refresh` part or `hideRefresh`.
 * 4. **Structured `{ logic, handlers }` bundles.** The view consumes two typed
 *    bundles rather than a flat prop spread, so `Content` reconstructs
 *    `ssoProviderCreateLogicProps` and `ssoProviderCreateHandlerProps` exactly
 *    as the container does before rendering the view.
 *
 * Therefore this layer offers only **structural wrapping (`Root` / `Content` /
 * `DefaultLayout`)** plus the **Tier-4 model hook** — no `Header`,
 * `CreateAction`, or `Refresh` parts.
 *
 * @module sso-provider-create.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  SsoProviderCreate as SsoProviderCreateDefault,
  SsoProviderCreateView,
} from '@/components/auth0/my-organization/sso-provider-create';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useSsoProviderCreate } from '@/hooks/my-organization/use-sso-provider-create';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { createComponentContext } from '@/lib/composability';
import type {
  SsoProviderCreateHandlerProps,
  SsoProviderCreateLogicProps,
  SsoProviderCreateProps,
  UseSsoProviderCreateResult,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/** Value shared from `Root` to every compound part. */
interface SsoProviderCreateComposition {
  model: UseSsoProviderCreateResult;
  props: SsoProviderCreateProps;
}

const [SsoProviderCreateContext, useSsoProviderCreateContext] =
  createComponentContext<SsoProviderCreateComposition>('SsoProviderCreate');

const DEFAULT_STYLING: NonNullable<SsoProviderCreateProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link SsoProviderCreateProps} plus children. */
export interface SsoProviderCreateRootProps extends SsoProviderCreateProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the loading gate + themed scope.
 *
 * Mirrors the Tier-1 container exactly, including its `GateKeeper` usage — note
 * the container passes **no** `isLoading` prop (the wizard manages its own
 * per-step loading), so this `Root` replicates that.
 * @param props - {@link SsoProviderCreateRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: SsoProviderCreateRootProps) {
  useTelemetry('sso-create-configuration');

  const {
    createAction,
    customMessages = {},
    styling = DEFAULT_STYLING,
    onNext,
    onPrevious,
  } = props;

  const model = useSsoProviderCreate({
    createAction,
    customMessages,
    onNext,
    onPrevious,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<SsoProviderCreateComposition>(
    () => ({ model, props: { ...props, styling, customMessages } }),
    [model, props, styling, customMessages],
  );

  return (
    <SsoProviderCreateContext.Provider value={composition}>
      <GateKeeper styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </SsoProviderCreateContext.Provider>
  );
}

Root.displayName = 'SsoProviderCreate.Root';

/**
 * The wizard body (header + multi-step provider creation wizard). Reuses the
 * existing view, reconstructing the `{ logic, handlers }` bundles from the
 * shared model + props **exactly** as the Tier-1 container does.
 *
 * The view always renders its own header (no `hideHeader`); see the module
 * HURDLE note.
 * @returns The wizard content.
 */
function Content() {
  const { model, props } = useSsoProviderCreateContext();

  const {
    formData,
    detailsRef,
    configureRef,
    setFormData,
    handleCreate,
    createStepActions,
    isCreating,
    isLoadingConfig,
    filteredStrategies,
    isLoadingIdpConfig,
    idpConfig,
    showThirdPartyAccess,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
    isOrganizationBlocked,
  } = model;

  const { onNext, onPrevious, backButton } = props;
  const { strategy, details, configure } = formData;

  const ssoProviderCreateLogicProps: SsoProviderCreateLogicProps = {
    formData,
    strategy,
    details,
    configure,
    isCreating,
    isLoadingConfig,
    filteredStrategies,
    isLoadingIdpConfig,
    idpConfig,
    showThirdPartyAccess,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
    isOrganizationBlocked,
    styling: props.styling ?? DEFAULT_STYLING,
    customMessages: props.customMessages,
    backButton,
  };

  const ssoProviderCreateHandlerProps: SsoProviderCreateHandlerProps = {
    onNext,
    onPrevious,
    setFormData,
    detailsRef,
    configureRef,
    handleCreate,
    createStepActions,
  };

  return (
    <SsoProviderCreateView
      logic={ssoProviderCreateLogicProps}
      handlers={ssoProviderCreateHandlerProps}
    />
  );
}

Content.displayName = 'SsoProviderCreate.Content';

/**
 * The default anatomy: just the wizard content. Wrapping in `Root` +
 * `DefaultLayout` reproduces the Tier-1 visual output exactly, so hosts can opt
 * into composition incrementally.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  return <Content />;
}

DefaultLayout.displayName = 'SsoProviderCreate.DefaultLayout';

/**
 * SSO provider creation wizard with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<SsoProviderCreate {...props} />`),
 * and exposes structural compound parts (`Root` / `Content` / `DefaultLayout`)
 * for Tier-3 composition. For fully headless (Tier 4) usage, see
 * `useSsoProviderCreateModel`.
 *
 * See the module HURDLE note for why no `Header` / action / `Refresh` parts are
 * offered (wizard-owned navigation, always-on header, no refresh surface).
 *
 * @example Tier 3 — interleave host UI around the wizard
 * ```tsx
 * <SsoProviderCreate.Root {...props}>
 *   <HostGuidancePanel />
 *   <SsoProviderCreate.Content />
 * </SsoProviderCreate.Root>
 * ```
 */
const SsoProviderCreate = Object.assign(SsoProviderCreateDefault, {
  Root,
  DefaultLayout,
  Content,
});

export { SsoProviderCreate, Root, DefaultLayout, Content, useSsoProviderCreateContext };
