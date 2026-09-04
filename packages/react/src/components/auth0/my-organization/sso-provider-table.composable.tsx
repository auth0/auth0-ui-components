/**
 * Progressive-composability layer for {@link SsoProviderTable}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`,
 * `CreateAction`, `Refresh`, `Content`) on top of the existing container/view
 * split, with zero breaking changes to the Tier-1 default usage
 * (`<SsoProviderTable {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<SsoProviderTable {...props} />`
 * - Tier 2 (narrow):  `<SsoProviderTable.Root><SsoProviderTable.DefaultLayout>`
 *     `<SsoProviderTable.CreateAction render={<HostButton />} />` ...
 * - Tier 3 (structural): compose `Header` / `Refresh` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless): `useSsoProviderTableModel(options)` — see index re-export.
 *
 * @module sso-provider-table.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import {
  SsoProviderTable as SsoProviderTableDefault,
  SsoProviderTableView,
} from '@/components/auth0/my-organization/sso-provider-table';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { useSsoProviderTable } from '@/hooks/my-organization/use-sso-provider-table';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext, mergeRenderProp } from '@/lib/composability';
import { cn } from '@/lib/utils';
import type {
  SsoProviderTableProps,
  UseSsoProviderTableReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/** Value shared from `Root` to every compound part. */
interface SsoProviderTableComposition {
  model: UseSsoProviderTableReturn;
  props: SsoProviderTableProps;
}

const [SsoProviderTableContext, useSsoProviderTableContext] =
  createComponentContext<SsoProviderTableComposition>('SsoProviderTable');

const DEFAULT_STYLING: NonNullable<SsoProviderTableProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link SsoProviderTableProps} plus children. */
export interface SsoProviderTableRootProps extends SsoProviderTableProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 * @param props - {@link SsoProviderTableRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: SsoProviderTableRootProps) {
  useTelemetry('sso-table-configuration');

  const {
    customMessages = {},
    styling = DEFAULT_STYLING,
    readOnly = false,
    createAction,
    editAction,
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
  } = props;

  const model = useSsoProviderTable({
    readOnly,
    customMessages,
    createAction,
    editAction,
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<SsoProviderTableComposition>(
    () => ({ model, props: { ...props, styling, readOnly, customMessages } }),
    [model, props, styling, readOnly, customMessages],
  );

  return (
    <SsoProviderTableContext.Provider value={composition}>
      <GateKeeper isLoading={model.isLoading} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </SsoProviderTableContext.Provider>
  );
}

Root.displayName = 'SsoProviderTable.Root';

/** Props for {@link CreateAction}. */
export interface SsoProviderTableCreateActionProps {
  /** Host element to render in place of the default UIC button. */
  render?: React.ReactElement;
}

/**
 * The create-provider trigger. Renders the default UIC button, or a
 * host-supplied element via `render`, wired to the model's create command.
 * Hidden/disabled state follows the same rules as the Tier-1 header button.
 * @param props - {@link SsoProviderTableCreateActionProps}
 * @returns The create action element, or `null` when create is hidden.
 */
function CreateAction({ render }: SsoProviderTableCreateActionProps) {
  const { model, props } = useSsoProviderTableContext();
  const { t } = useTranslator('idp_management.sso_provider_table', props.customMessages);

  if (model.shouldHideCreate || model.isViewLoading) {
    return null;
  }

  const label = t('header.create_button_text');
  const disabled = Boolean(props.createAction?.disabled) || Boolean(props.readOnly);
  const onClick = () => model.handleCreate();

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

CreateAction.displayName = 'SsoProviderTable.CreateAction';

/** Props for {@link SsoProviderTableHeader}. */
export interface SsoProviderTableHeaderProps {
  /** Action node rendered in the header's action region. Defaults to {@link CreateAction}. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Title/description region. Owns the header copy; the action region defaults to
 * {@link CreateAction} but can be replaced by the host.
 * @param props - {@link SsoProviderTableHeaderProps}
 * @returns The header element.
 */
function SsoProviderTableHeader({ action, className }: SsoProviderTableHeaderProps) {
  const { model, props } = useSsoProviderTableContext();
  const { t } = useTranslator('idp_management.sso_provider_table', props.customMessages);

  return (
    <div className={cn(props.styling?.classes?.['SsoProviderTable-header'], className)}>
      <Header
        title={t('header.title')}
        description={t('header.description')}
        isLoading={model.isViewLoading}
        actionSlot={action ?? <CreateAction />}
      />
    </div>
  );
}

SsoProviderTableHeader.displayName = 'SsoProviderTable.Header';

/** Props for {@link Refresh}. */
export interface SsoProviderTableRefreshProps {
  className?: string;
}

/**
 * The last-updated / manual-refresh control. Movable — hosts place it before or
 * after {@link Content} in a structural layout.
 * @param props - {@link SsoProviderTableRefreshProps}
 * @returns The refresh control.
 */
function Refresh({ className }: SsoProviderTableRefreshProps) {
  const { model, props } = useSsoProviderTableContext();
  return (
    <div
      className={cn(
        'flex justify-end mb-8',
        props.styling?.classes?.['SsoProviderTable-tableActions'],
        className,
      )}
    >
      <RefreshIndicator
        isStale={model.isProvidersStale}
        isFetching={model.isRefetchingProviders}
        lastUpdatedAt={model.providersUpdatedAt || undefined}
        onRefresh={model.refetchProviders}
      />
    </div>
  );
}

Refresh.displayName = 'SsoProviderTable.Refresh';

/**
 * The table body (data table + row actions + modals). Reuses the existing view
 * with its header and refresh regions suppressed, since those are owned by the
 * {@link SsoProviderTableHeader} and {@link Refresh} parts in composition.
 * @returns The table content.
 */
function Content() {
  const { model, props } = useSsoProviderTableContext();
  return (
    <SsoProviderTableView
      {...model}
      styling={props.styling ?? DEFAULT_STYLING}
      customMessages={props.customMessages}
      readOnly={Boolean(props.readOnly)}
      hideHeader
      hideRefresh
      hideDeleteProvider={props.hideDeleteProvider}
      hideRemoveFromOrganization={props.hideRemoveFromOrganization}
      createAction={props.createAction}
      editAction={props.editAction}
      enableProviderAction={props.enableProviderAction}
    />
  );
}

Content.displayName = 'SsoProviderTable.Content';

/**
 * The default anatomy: header (with create action) → refresh → content. Wrapping
 * in `Root` + `DefaultLayout` reproduces the Tier-1 visual output exactly, so
 * hosts can opt into composition incrementally.
 * @param props - Optional narrow-replacement slot for the create action.
 * @param props.children - When provided, replaces the default create action in the header.
 * @returns The default layout subtree.
 */
function DefaultLayout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <SsoProviderTableHeader action={children} />
      <Refresh />
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'SsoProviderTable.DefaultLayout';

/**
 * SSO identity providers table with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<SsoProviderTable {...props} />`),
 * and exposes compound parts for narrow (Tier 2) and structural (Tier 3)
 * composition. For fully headless (Tier 4) usage, see `useSsoProviderTableModel`.
 *
 * @example Tier 2 — replace the create button
 * ```tsx
 * <SsoProviderTable.Root {...props}>
 *   <SsoProviderTable.DefaultLayout>
 *     <SsoProviderTable.CreateAction render={<HostButton>Add connection</HostButton>} />
 *   </SsoProviderTable.DefaultLayout>
 * </SsoProviderTable.Root>
 * ```
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <SsoProviderTable.Root {...props}>
 *   <SsoProviderTable.Header action={<SsoProviderTable.CreateAction render={<HostButton />} />} />
 *   <HostGuidancePanel />
 *   <SsoProviderTable.Content />
 *   <SsoProviderTable.Refresh />
 * </SsoProviderTable.Root>
 * ```
 */
const SsoProviderTable = Object.assign(SsoProviderTableDefault, {
  Root,
  DefaultLayout,
  Header: SsoProviderTableHeader,
  CreateAction,
  Refresh,
  Content,
});

export {
  SsoProviderTable,
  Root,
  DefaultLayout,
  SsoProviderTableHeader as Header,
  CreateAction,
  Refresh,
  Content,
  useSsoProviderTableContext,
};
