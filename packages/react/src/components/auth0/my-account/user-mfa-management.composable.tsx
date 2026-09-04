/**
 * Progressive-composability layer for {@link UserMFAManagement}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`, `Content`) on
 * top of the existing container/view split, with zero breaking changes to the
 * Tier-1 default usage (`<UserMFAManagement {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default):    `<UserMFAManagement {...props} />`
 * - Tier 3 (structural): compose `Header` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless):   `useUserMFAModel(options)` — see index re-export.
 *
 * ---
 * ## HURDLE — no uniform host-replaceable action (Tier 2 does not apply)
 *
 * Unlike single-action table components (e.g. `SsoProviderTable`, whose one
 * "Create" button is a natural render-prop slot), MFA's primary action is
 * **per-factor**: each visible factor type renders its own "Enroll" button
 * *inside its own Card*, deep within {@link UserMFAManagementView}. There is no
 * single, top-level action to host-replace, so there is deliberately **no
 * `EnrollAction` part and no Tier-2 render-prop layer** here — providing one
 * would be dishonest, since it could not map onto the N per-factor buttons.
 *
 * Hosts that need fully custom per-factor enroll UI use **Tier 4**: the model
 * hook (`useUserMFAModel`) exposes `handleEnroll(factorType)`, `visibleFactorTypes`,
 * `factorsByType`, and all per-factor enrollment state, so a host can render its
 * own factor cards/buttons and drive enrollment directly. This component is the
 * clearest case in the library where the uniform action-slot pattern does not fit.
 *
 * @module user-mfa-management.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  UserMFAManagement as UserMFAManagementDefault,
  UserMFAManagementView,
} from '@/components/auth0/my-account/user-mfa-management';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useUserMFA } from '@/hooks/my-account/use-user-mfa';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext } from '@/lib/composability';
import type {
  UserMFAManagementProps,
  UseUserMFAReturn,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

/** Value shared from `Root` to every compound part. */
interface UserMFAManagementComposition {
  model: UseUserMFAReturn;
  props: UserMFAManagementProps;
}

const [UserMFAManagementContext, useUserMFAManagementContext] =
  createComponentContext<UserMFAManagementComposition>('UserMFAManagement');

const DEFAULT_STYLING: NonNullable<UserMFAManagementProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link UserMFAManagementProps} plus children. */
export interface UserMFAManagementRootProps extends UserMFAManagementProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 *
 * The hook receives exactly the same options the Tier-1 container passes it:
 * `disableEnroll` and `schema` are intentionally *not* forwarded to the hook —
 * they flow straight to the view via {@link Content}.
 * @param props - {@link UserMFAManagementRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: UserMFAManagementRootProps) {
  useTelemetry('user-mfa-management');

  const {
    customMessages = {},
    styling = DEFAULT_STYLING,
    showActiveOnly = false,
    disableDelete = false,
    readOnly = false,
    factorConfig = {},
    enrollAction,
    deleteAction,
  } = props;

  const model = useUserMFA({
    showActiveOnly,
    readOnly,
    disableDelete,
    factorConfig,
    customMessages,
    enrollAction,
    deleteAction,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<UserMFAManagementComposition>(
    () => ({ model, props: { ...props, styling, customMessages } }),
    [model, props, styling, customMessages],
  );

  return (
    <UserMFAManagementContext.Provider value={composition}>
      <GateKeeper isLoading={model.isLoadingFactors} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </UserMFAManagementContext.Provider>
  );
}

Root.displayName = 'UserMFAManagement.Root';

/** Props for {@link UserMFAManagementHeader}. */
export interface UserMFAManagementHeaderProps {
  className?: string;
}

/**
 * Title/description region. Owns the header copy. MFA has no header-level action
 * (enroll is per-factor — see the module HURDLE note), so the header renders
 * title + description only.
 * @param props - {@link UserMFAManagementHeaderProps}
 * @returns The header element.
 */
function UserMFAManagementHeader({ className }: UserMFAManagementHeaderProps) {
  const { props } = useUserMFAManagementContext();
  const { t } = useTranslator('user_mfa_management', props.customMessages);

  return (
    <div className={className}>
      <Header title={t('header.title')} description={t('header.description')} />
    </div>
  );
}

UserMFAManagementHeader.displayName = 'UserMFAManagement.Header';

/**
 * The factor list body (per-factor cards + enroll/delete buttons + enroll/delete
 * modals). Reuses the existing view with its header suppressed (`hideHeader`),
 * since the header is owned by the {@link UserMFAManagementHeader} part in
 * composition.
 *
 * Prop pass-through mirrors the Tier-1 container's view render exactly: the model
 * supplies all factor/enrollment state and handlers, while the container-level
 * props (`schema`, `styling`, `customMessages`, `showActiveOnly`, `disableEnroll`,
 * `disableDelete`, `readOnly`, `factorConfig`) come from `Root`.
 * @returns The factor list content.
 */
function Content() {
  const { model, props } = useUserMFAManagementContext();
  return (
    <UserMFAManagementView
      {...model}
      schema={props.schema}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      hideHeader
      showActiveOnly={Boolean(props.showActiveOnly)}
      disableEnroll={Boolean(props.disableEnroll)}
      disableDelete={Boolean(props.disableDelete)}
      readOnly={Boolean(props.readOnly)}
      factorConfig={props.factorConfig}
      onEnrollFactor={model.handleEnroll}
      onDeleteFactor={model.handleDeleteFactor}
      onCloseEnrollDialog={model.handleCloseEnrollDialog}
      onConfirmDelete={model.handleConfirmDelete}
      onCancelDelete={model.handleCancelDelete}
      onSubmitContact={model.handleSendCode}
      onResendCode={model.handleResendCode}
      onConfirmOtp={model.handleConfirmOtp}
      onContinueQRScan={model.handleConfirmPush}
      onConfirmRecoveryCode={model.handleConfirmRecoveryCode}
      onStartQREnrollment={model.handleEnterQRPhase}
    />
  );
}

Content.displayName = 'UserMFAManagement.Content';

/**
 * The default anatomy: header → content. Wrapping in `Root` + `DefaultLayout`
 * reproduces the Tier-1 visual output exactly, so hosts can opt into composition
 * incrementally.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  return (
    <>
      <UserMFAManagementHeader />
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'UserMFAManagement.DefaultLayout';

/**
 * MFA management with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<UserMFAManagement {...props} />`),
 * and exposes compound parts (`Root`, `DefaultLayout`, `Header`, `Content`) for
 * structural (Tier 3) composition. For fully headless (Tier 4) usage, see
 * `useUserMFAModel`.
 *
 * There is intentionally **no Tier-2 render-prop / `EnrollAction` part**: the
 * enroll action is per-factor, not a single top-level control (see the module
 * HURDLE note). Hosts needing custom per-factor enroll UI use Tier 4.
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <UserMFAManagement.Root {...props}>
 *   <UserMFAManagement.Header />
 *   <HostSecurityGuidancePanel />
 *   <UserMFAManagement.Content />
 * </UserMFAManagement.Root>
 * ```
 */
const UserMFAManagement = Object.assign(UserMFAManagementDefault, {
  Root,
  DefaultLayout,
  Header: UserMFAManagementHeader,
  Content,
});

export {
  UserMFAManagement,
  Root,
  DefaultLayout,
  UserMFAManagementHeader as Header,
  Content,
  useUserMFAManagementContext,
};
