/**
 * Progressive-composability layer for {@link OrganizationMemberManagement}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`,
 * `InviteAction`, `Refresh`, `Content`) on top of the existing container/view
 * split, with zero breaking changes to the Tier-1 default usage
 * (`<OrganizationMemberManagement {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<OrganizationMemberManagement {...props} />`
 * - Tier 2 (narrow):  `<OrganizationMemberManagement.Root><OrganizationMemberManagement.DefaultLayout>`
 *     `<OrganizationMemberManagement.InviteAction render={<HostButton />} />` ...
 * - Tier 3 (structural): compose `Header` / `Refresh` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless): `useOrganizationMemberManagementModel(options)` — see index re-export.
 *
 * @module organization-member-management.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import {
  OrganizationMemberManagement as OrganizationMemberManagementDefault,
  OrganizationMemberManagementView,
} from '@/components/auth0/my-organization/organization-member-management';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext, mergeRenderProp } from '@/lib/composability';
import { cn } from '@/lib/utils';
import type {
  OrganizationMemberManagementProps,
  UseOrganizationMemberManagementResult,
} from '@/types/my-organization/member-management/organization-member-management-types';

/** Value shared from `Root` to every compound part. */
interface OrganizationMemberManagementComposition {
  model: UseOrganizationMemberManagementResult;
  props: OrganizationMemberManagementProps;
}

const [OrganizationMemberManagementContext, useOrganizationMemberManagementContext] =
  createComponentContext<OrganizationMemberManagementComposition>('OrganizationMemberManagement');

const DEFAULT_STYLING: NonNullable<OrganizationMemberManagementProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link OrganizationMemberManagementProps} plus children. */
export interface OrganizationMemberManagementRootProps extends OrganizationMemberManagementProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 * @param props - {@link OrganizationMemberManagementRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: OrganizationMemberManagementRootProps) {
  const {
    customMessages = {},
    styling = DEFAULT_STYLING,
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    viewMemberDetailsAction,
    assignRolesAction,
    removeFromOrganizationAction,
  } = props;

  const model = useOrganizationMemberManagement({
    customMessages,
    readOnly,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    viewMemberDetailsAction,
    assignRolesAction,
    removeFromOrganizationAction,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<OrganizationMemberManagementComposition>(
    () => ({ model, props: { ...props, styling, readOnly, customMessages } }),
    [model, props, styling, readOnly, customMessages],
  );

  return (
    <OrganizationMemberManagementContext.Provider value={composition}>
      <GateKeeper isLoading={model.isInitialLoading} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </OrganizationMemberManagementContext.Provider>
  );
}

Root.displayName = 'OrganizationMemberManagement.Root';

/** Props for {@link InviteAction}. */
export interface OrganizationMemberManagementInviteActionProps {
  /** Host element to render in place of the default UIC button. */
  render?: React.ReactElement;
}

/**
 * The invite-member trigger. Renders the default UIC button, or a host-supplied
 * element via `render`, wired to the model's create-invitation command. Follows
 * the same rule as the Tier-1 header: omitted entirely when `readOnly`.
 * @param props - {@link OrganizationMemberManagementInviteActionProps}
 * @returns The invite action element, or `null` when read-only.
 */
function InviteAction({ render }: OrganizationMemberManagementInviteActionProps) {
  const { model, props } = useOrganizationMemberManagementContext();
  const { t } = useTranslator('member_management', props.customMessages);

  if (props.readOnly) {
    return null;
  }

  const label = t('invite_button');
  const disabled = Boolean(props.readOnly);
  const onClick = () => model.openModal({ type: 'create' });

  if (render) {
    // The host element owns its own label/content; we only wire behavior.
    return mergeRenderProp(render, { type: 'button', disabled, onClick });
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center gap-2 w-full sm:w-auto sm:min-w-fit"
    >
      <Plus className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Button>
  );
}

InviteAction.displayName = 'OrganizationMemberManagement.InviteAction';

/** Props for {@link OrganizationMemberManagementHeader}. */
export interface OrganizationMemberManagementHeaderProps {
  /** Action node rendered in the header's action region. Defaults to {@link InviteAction}. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Title/description region. Owns the header copy; the action region defaults to
 * {@link InviteAction} but can be replaced by the host.
 * @param props - {@link OrganizationMemberManagementHeaderProps}
 * @returns The header element.
 */
function OrganizationMemberManagementHeader({
  action,
  className,
}: OrganizationMemberManagementHeaderProps) {
  const { props } = useOrganizationMemberManagementContext();
  const { t } = useTranslator('member_management', props.customMessages);

  return (
    <div className={cn(props.styling?.classes?.['OrganizationMemberManagement-header'], className)}>
      <Header
        title={t('header.title')}
        description={t('header.description')}
        actionSlot={action ?? <InviteAction />}
      />
    </div>
  );
}

OrganizationMemberManagementHeader.displayName = 'OrganizationMemberManagement.Header';

/** Props for {@link Refresh}. */
export interface OrganizationMemberManagementRefreshProps {
  className?: string;
}

/**
 * The last-updated / manual-refresh control. Tab-dependent: reflects members or
 * invitations depending on the active tab.
 *
 * NOTE: In the Tier-1 layout this control is visually coupled inside the Tabs
 * row (next to `TabsList`). As a standalone compound part it is visually
 * detached from the tabs, so Tier-3 hosts that place it outside the tab row
 * should expect it to sit apart from the members/invitations toggle.
 * @param props - {@link OrganizationMemberManagementRefreshProps}
 * @returns The refresh control.
 */
function Refresh({ className }: OrganizationMemberManagementRefreshProps) {
  const { model, props } = useOrganizationMemberManagementContext();

  const refreshState =
    model.activeTab === 'members'
      ? {
          isStale: model.isMembersStale,
          isFetching: model.isFetchingMembers,
          lastUpdatedAt: model.membersUpdatedAt || undefined,
          onRefresh: model.refetchMembers,
        }
      : {
          isStale: model.isInvitationsStale,
          isFetching: model.isFetchingInvitations,
          lastUpdatedAt: model.invitationsUpdatedAt || undefined,
          onRefresh: model.refetchInvitations,
        };

  return (
    <div
      className={cn(
        'flex justify-end mb-8',
        props.styling?.classes?.['OrganizationMemberManagement-tableActions'],
        className,
      )}
    >
      <RefreshIndicator
        isStale={refreshState.isStale}
        isFetching={refreshState.isFetching}
        lastUpdatedAt={refreshState.lastUpdatedAt}
        onRefresh={refreshState.onRefresh}
      />
    </div>
  );
}

Refresh.displayName = 'OrganizationMemberManagement.Refresh';

/**
 * The tabs body (members/invitations tables + modals). Reuses the existing view
 * with its header and refresh regions suppressed, since those are owned by the
 * {@link OrganizationMemberManagementHeader} and {@link Refresh} parts in
 * composition.
 * @returns The tabs content.
 */
function Content() {
  const { model, props } = useOrganizationMemberManagementContext();
  return (
    <OrganizationMemberManagementView
      {...model}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      readOnly={Boolean(props.readOnly)}
      hideHeader
      hideRefresh
    />
  );
}

Content.displayName = 'OrganizationMemberManagement.Content';

/**
 * The default anatomy: header (with invite action) → content (with the built-in
 * tab-coupled refresh). Wrapping in `Root` + `DefaultLayout` reproduces the
 * Tier-1 visual output exactly, so hosts can opt into composition incrementally.
 * @param props - Optional narrow-replacement slot for the invite action.
 * @param props.children - When provided, replaces the default invite action in the header.
 * @returns The default layout subtree.
 */
function DefaultLayout({ children }: { children?: React.ReactNode }) {
  const { model, props } = useOrganizationMemberManagementContext();
  return (
    <>
      <OrganizationMemberManagementHeader action={children} />
      <OrganizationMemberManagementView
        {...model}
        styling={props.styling ?? DEFAULT_STYLING}
        customMessages={props.customMessages}
        readOnly={Boolean(props.readOnly)}
        hideHeader
      />
    </>
  );
}

DefaultLayout.displayName = 'OrganizationMemberManagement.DefaultLayout';

/**
 * Organization member management with progressive composability.
 *
 * Callable directly for the Tier-1 default
 * (`<OrganizationMemberManagement {...props} />`), and exposes compound parts
 * for narrow (Tier 2) and structural (Tier 3) composition. For fully headless
 * (Tier 4) usage, see `useOrganizationMemberManagementModel`.
 *
 * @example Tier 2 — replace the invite button
 * ```tsx
 * <OrganizationMemberManagement.Root {...props}>
 *   <OrganizationMemberManagement.DefaultLayout>
 *     <OrganizationMemberManagement.InviteAction render={<HostButton>Invite</HostButton>} />
 *   </OrganizationMemberManagement.DefaultLayout>
 * </OrganizationMemberManagement.Root>
 * ```
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <OrganizationMemberManagement.Root {...props}>
 *   <OrganizationMemberManagement.Header />
 *   <HostGuidancePanel />
 *   <OrganizationMemberManagement.Refresh />
 *   <OrganizationMemberManagement.Content />
 * </OrganizationMemberManagement.Root>
 * ```
 */
const OrganizationMemberManagement = Object.assign(OrganizationMemberManagementDefault, {
  Root,
  DefaultLayout,
  Header: OrganizationMemberManagementHeader,
  InviteAction,
  Refresh,
  Content,
});

export {
  OrganizationMemberManagement,
  Root,
  DefaultLayout,
  OrganizationMemberManagementHeader as Header,
  InviteAction,
  Refresh,
  Content,
  useOrganizationMemberManagementContext,
};
