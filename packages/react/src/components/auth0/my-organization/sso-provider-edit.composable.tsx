/**
 * Progressive-composability layer for {@link SsoProviderEdit}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`, `Content`) on
 * top of the existing container/view split, with zero breaking changes to the
 * Tier-1 default usage (`<SsoProviderEdit {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<SsoProviderEdit {...props} />`
 * - Tier 3 (structural): compose `Header` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless): `useSsoProviderEditModel(providerId, options)` — see index re-export.
 *
 * HURDLES — why there is no Tier-2 render-prop action here (unlike the
 * SsoProviderTable pilot's `CreateAction`):
 * 1. The header's primary action is a SWITCH (enable/disable toggle), whose
 *    contract is `onCheckedChange(checked: boolean)`, not `onClick`. The shared
 *    {@link mergeRenderProp} helper is button/`onClick`-oriented (it chains
 *    `onClick` and honours `event.preventDefault()`), so it does not apply to a
 *    switch. No host-replaceable `ToggleAction` render-prop is offered; the
 *    switch is rendered by the shared {@link Header} exactly as in Tier 1.
 * 2. The Save action lives INSIDE the SSO tab (`formActions.nextAction`), not in
 *    the header — it is not exposed as a header slot and therefore is not
 *    host-replaceable via composition either.
 *
 * Hosts needing custom enable/save controls should drop to Tier 4
 * (`useSsoProviderEditModel`) and drive `handleToggleProvider` / `updateProvider`
 * from their own UI.
 *
 * @module sso-provider-edit.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  SsoProviderEdit as SsoProviderEditDefault,
  SsoProviderEditView,
} from '@/components/auth0/my-organization/sso-provider-edit';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useSsoProviderEdit } from '@/hooks/my-organization/use-sso-provider-edit';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext } from '@/lib/composability';
import { cn } from '@/lib/utils';
import type {
  SsoProviderEditProps,
  UseSsoProviderEditReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

/** Value shared from `Root` to every compound part. */
interface SsoProviderEditComposition {
  model: UseSsoProviderEditReturn;
  /** Normalized props (defaults applied) shared with every part. */
  props: SsoProviderEditProps;
}

const [SsoProviderEditContext, useSsoProviderEditContext] =
  createComponentContext<SsoProviderEditComposition>('SsoProviderEdit');

const DEFAULT_STYLING: NonNullable<SsoProviderEditProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link SsoProviderEditProps} plus children. */
export interface SsoProviderEditRootProps extends SsoProviderEditProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 * @param props - {@link SsoProviderEditRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: SsoProviderEditRootProps) {
  useTelemetry('sso-edit-configuration');

  const {
    providerId,
    sso,
    provisioning,
    domains,
    hideHeader = false,
    hideProvisioningTab = false,
    hideDeleteProvider = false,
    hideRemoveFromOrganization = false,
    hideAttributeMappings = false,
    customMessages = {},
    styling = DEFAULT_STYLING,
    readOnly = false,
    enableProviderAction,
  } = props;

  const model = useSsoProviderEdit(providerId, {
    sso,
    provisioning,
    domains,
    customMessages,
    skipProvisioningFetch: hideProvisioningTab && hideAttributeMappings,
    enableProviderAction,
  });

  const isLoading = model.isLoading || model.isLoadingConfig || model.isLoadingIdpConfig;

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<SsoProviderEditComposition>(
    () => ({
      model,
      props: {
        ...props,
        styling,
        readOnly,
        customMessages,
        hideHeader,
        hideProvisioningTab,
        hideDeleteProvider,
        hideRemoveFromOrganization,
        hideAttributeMappings,
      },
    }),
    [
      model,
      props,
      styling,
      readOnly,
      customMessages,
      hideHeader,
      hideProvisioningTab,
      hideDeleteProvider,
      hideRemoveFromOrganization,
      hideAttributeMappings,
    ],
  );

  return (
    <SsoProviderEditContext.Provider value={composition}>
      <GateKeeper isLoading={isLoading} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </SsoProviderEditContext.Provider>
  );
}

Root.displayName = 'SsoProviderEdit.Root';

/** Props for {@link SsoProviderEditHeader}. */
export interface SsoProviderEditHeaderProps {
  className?: string;
}

/**
 * Title / back-button / enable-toggle region. Mirrors the view's header block.
 * The single action is a SWITCH (enable/disable toggle) rendered by the shared
 * {@link Header}; it is not host-replaceable (see module HURDLES).
 * @param props - {@link SsoProviderEditHeaderProps}
 * @returns The header element.
 */
function SsoProviderEditHeader({ className }: SsoProviderEditHeaderProps) {
  const { model, props } = useSsoProviderEditContext();
  const { t } = useTranslator('idp_management.edit_sso_provider', props.customMessages);

  return (
    <Header
      title={model.provider?.display_name || model.provider?.name || ''}
      backButton={
        props.backButton && {
          ...props.backButton,
          text: t('header.back_button_text'),
        }
      }
      isLoading={model.isUpdating}
      actions={[
        {
          type: 'switch',
          checked: model.provider?.is_enabled ?? false,
          onCheckedChange: model.handleToggleProvider,
          disabled:
            props.readOnly ||
            model.isUpdating ||
            model.isEnabling ||
            props.enableProviderAction?.disabled,
          tooltip: {
            content: model.provider?.is_enabled
              ? t('header.disable_provider_tooltip_text')
              : t('header.enable_provider_tooltip_text'),
          },
        },
      ]}
      className={cn(props.styling?.classes?.['SsoProviderEdit-header'], className)}
    />
  );
}

SsoProviderEditHeader.displayName = 'SsoProviderEdit.Header';

/**
 * The tabbed editor body (SSO / provisioning / domains tabs + modals). Reuses
 * the existing view with its header suppressed, since the header is owned by the
 * {@link SsoProviderEditHeader} part in composition. Replicates the container's
 * exact prop pass-through (see `sso-provider-edit.tsx` view render).
 * @returns The editor content.
 */
function Content() {
  const { model, props } = useSsoProviderEditContext();
  return (
    <SsoProviderEditView
      {...model}
      showProvisioningTab={model.showProvisioningTab && !props.hideProvisioningTab}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      backButton={props.backButton}
      schema={props.schema}
      readOnly={Boolean(props.readOnly)}
      providerId={props.providerId}
      domains={props.domains}
      hideHeader
      hideProvisioningTab={props.hideProvisioningTab}
      hideDeleteProvider={props.hideDeleteProvider}
      hideRemoveFromOrganization={props.hideRemoveFromOrganization}
      hideAttributeMappings={props.hideAttributeMappings}
      enableProviderAction={props.enableProviderAction}
    />
  );
}

Content.displayName = 'SsoProviderEdit.Content';

/**
 * The default anatomy: header (with enable toggle) → content. Wrapping in
 * `Root` + `DefaultLayout` reproduces the Tier-1 visual output, so hosts can
 * opt into composition incrementally.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  return (
    <>
      <SsoProviderEditHeader />
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'SsoProviderEdit.DefaultLayout';

/**
 * SSO provider edit interface with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<SsoProviderEdit {...props} />`),
 * and exposes compound parts (`Root`, `DefaultLayout`, `Header`, `Content`) for
 * structural (Tier 3) composition. For fully headless (Tier 4) usage, see
 * `useSsoProviderEditModel`.
 *
 * The header's enable/disable toggle is a switch and the save action lives in
 * the SSO tab; neither is host-replaceable via a render prop (see module
 * HURDLES). Hosts needing custom controls use Tier 4.
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <SsoProviderEdit.Root {...props}>
 *   <SsoProviderEdit.Header />
 *   <HostGuidancePanel />
 *   <SsoProviderEdit.Content />
 * </SsoProviderEdit.Root>
 * ```
 */
const SsoProviderEdit = Object.assign(SsoProviderEditDefault, {
  Root,
  DefaultLayout,
  Header: SsoProviderEditHeader,
  Content,
});

export {
  SsoProviderEdit,
  Root,
  DefaultLayout,
  SsoProviderEditHeader as Header,
  Content,
  useSsoProviderEditContext,
};
