/**
 * Progressive-composability layer for {@link UserPasskeyManagement}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`, `AddAction`,
 * `Content`) on top of the existing container/view split, with zero breaking
 * changes to the Tier-1 default usage (`<UserPasskeyManagement {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<UserPasskeyManagement {...props} />`
 * - Tier 2 (narrow):  `<UserPasskeyManagement.Root><UserPasskeyManagement.DefaultLayout>`
 *     `<UserPasskeyManagement.AddAction render={<HostButton />} />` ...
 * - Tier 3 (structural): compose `Header` / `AddAction` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless): `useUserPasskeyModel(options)` — see index re-export.
 *
 * NOTE: this component has no manual-refresh affordance, so there is no `Refresh`
 * part and no `hideRefresh` pass-through (unlike the SsoProviderTable pilot).
 *
 * HURDLE — the native Add control lives INSIDE the passkey `Card` (as a
 * `CardAction`), not in the section header. So `DefaultLayout` keeps the Add
 * button where it natively renders (inside `Content`); the standalone
 * `AddAction` part exists for Tier-3 custom layouts where the host positions the
 * trigger themselves. Rendering `AddAction` alongside the default `Content` will
 * surface TWO add controls — hosts composing their own structure should pass
 * `hideHeader`-style discipline and avoid duplicating the trigger.
 *
 * @module user-passkey-management.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  UserPasskeyManagement as UserPasskeyManagementDefault,
  UserPasskeyManagementView,
} from '@/components/auth0/my-account/user-passkey-management';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useUserPasskey } from '@/hooks/my-account/use-user-passkey';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext, mergeRenderProp } from '@/lib/composability';
import type {
  UserPasskeyManagementProps,
  UseUserPasskeyReturn,
} from '@/types/my-account/user-passkey-management/user-passkey-management-types';

/** Value shared from `Root` to every compound part. */
interface UserPasskeyManagementComposition {
  model: UseUserPasskeyReturn;
  props: UserPasskeyManagementProps;
}

const [UserPasskeyManagementContext, useUserPasskeyManagementContext] =
  createComponentContext<UserPasskeyManagementComposition>('UserPasskeyManagement');

const DEFAULT_STYLING: NonNullable<UserPasskeyManagementProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link UserPasskeyManagementProps} plus children. */
export interface UserPasskeyManagementRootProps extends UserPasskeyManagementProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 * @param props - {@link UserPasskeyManagementRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: UserPasskeyManagementRootProps) {
  useTelemetry('user-passkey-management');

  const {
    customMessages = {},
    styling = DEFAULT_STYLING,
    hideHeader = false,
    addAction,
    revokeAction,
    onFetch,
  } = props;

  const model = useUserPasskey({
    customMessages,
    addAction,
    revokeAction,
    onFetch,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<UserPasskeyManagementComposition>(
    () => ({ model, props: { ...props, styling, customMessages, hideHeader } }),
    [model, props, styling, customMessages, hideHeader],
  );

  return (
    <UserPasskeyManagementContext.Provider value={composition}>
      <GateKeeper isLoading={model.isLoading} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </UserPasskeyManagementContext.Provider>
  );
}

Root.displayName = 'UserPasskeyManagement.Root';

/** Props for {@link AddAction}. */
export interface UserPasskeyManagementAddActionProps {
  /** Host element to render in place of the default UIC button. */
  render?: React.ReactElement;
}

/**
 * The add-passkey trigger. Renders the default UIC button, or a host-supplied
 * element via `render`, wired to the model's enroll command. Hidden when the
 * host disables adding; disabled while an enrollment is in flight.
 *
 * Intended for Tier-3 custom layouts where the host positions the trigger.
 * `DefaultLayout` does NOT use this part — the native Add control renders inside
 * `Content` (see module HURDLE note).
 * @param props - {@link UserPasskeyManagementAddActionProps}
 * @returns The add action element, or `null` when adding is disabled.
 */
function AddAction({ render }: UserPasskeyManagementAddActionProps) {
  const { model, props } = useUserPasskeyManagementContext();
  const { t } = useTranslator('passkey', props.customMessages);

  if (model.disableAdd) {
    return null;
  }

  const label = t('add_passkey');
  const disabled = model.isEnrolling;
  const onClick = () => model.handleAddPasskey();

  if (render) {
    // The host element owns its own label/content; we only wire behavior.
    return mergeRenderProp(render, { type: 'button', disabled, onClick });
  }

  return (
    <Button
      type="button"
      size="default"
      variant="outline"
      className="text-sm w-full sm:w-auto shrink-0"
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled}
    >
      {model.isEnrolling ? <Spinner size="sm" colorScheme="primary" aria-hidden="true" /> : label}
    </Button>
  );
}

AddAction.displayName = 'UserPasskeyManagement.AddAction';

/** Props for {@link UserPasskeyManagementHeader}. */
export interface UserPasskeyManagementHeaderProps {
  /** Action node rendered in the header's action region. Omitted by default,
   * mirroring the original (which has no header actions). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Title/description region. Owns the header copy. The original renders no header
 * action, so the action region stays empty unless the host supplies one.
 * @param props - {@link UserPasskeyManagementHeaderProps}
 * @returns The header element.
 */
function UserPasskeyManagementHeader({ action, className }: UserPasskeyManagementHeaderProps) {
  const { props } = useUserPasskeyManagementContext();
  const { t } = useTranslator('passkey', props.customMessages);

  return (
    <Header
      title={t('header.title')}
      description={t('header.description')}
      actionSlot={action ?? undefined}
      className={className}
    />
  );
}

UserPasskeyManagementHeader.displayName = 'UserPasskeyManagement.Header';

/**
 * The passkey body (list / empty state + native Add control + revoke modal).
 * Reuses the existing view with its header suppressed, since the header is owned
 * by the {@link UserPasskeyManagementHeader} part in composition.
 * @returns The passkey content.
 */
function Content() {
  const { model, props } = useUserPasskeyManagementContext();
  return (
    <UserPasskeyManagementView
      {...model}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      hideHeader
    />
  );
}

Content.displayName = 'UserPasskeyManagement.Content';

/**
 * The default anatomy: header → content. Wrapping in `Root` + `DefaultLayout`
 * reproduces the Tier-1 visual output exactly, so hosts can opt into composition
 * incrementally. The Add control renders natively inside `Content`.
 * @returns The default layout subtree.
 */
function DefaultLayout() {
  const { props } = useUserPasskeyManagementContext();
  return (
    <>
      {!props.hideHeader && <UserPasskeyManagementHeader />}
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'UserPasskeyManagement.DefaultLayout';

/**
 * Passkey management with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<UserPasskeyManagement {...props} />`),
 * and exposes compound parts for narrow (Tier 2) and structural (Tier 3)
 * composition. For fully headless (Tier 4) usage, see `useUserPasskeyModel`.
 *
 * @example Tier 2 — replace the add button
 * ```tsx
 * <UserPasskeyManagement.Root {...props}>
 *   <UserPasskeyManagement.Header />
 *   <UserPasskeyManagement.AddAction render={<HostButton>Add key</HostButton>} />
 *   <UserPasskeyManagement.Content />
 * </UserPasskeyManagement.Root>
 * ```
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <UserPasskeyManagement.Root {...props}>
 *   <UserPasskeyManagement.Header />
 *   <HostGuidancePanel />
 *   <UserPasskeyManagement.Content />
 * </UserPasskeyManagement.Root>
 * ```
 */
const UserPasskeyManagement = Object.assign(UserPasskeyManagementDefault, {
  Root,
  DefaultLayout,
  Header: UserPasskeyManagementHeader,
  AddAction,
  Content,
});

export {
  UserPasskeyManagement,
  Root,
  DefaultLayout,
  UserPasskeyManagementHeader as Header,
  AddAction,
  Content,
  useUserPasskeyManagementContext,
};
