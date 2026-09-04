/**
 * Progressive-composability layer for {@link DomainTable}.
 *
 * Adds compound sub-components (`Root`, `DefaultLayout`, `Header`,
 * `CreateAction`, `Refresh`, `Content`) on top of the existing container/view
 * split, with zero breaking changes to the Tier-1 default usage
 * (`<DomainTable {...props} />`).
 *
 * Tiers:
 * - Tier 1 (default): `<DomainTable {...props} />`
 * - Tier 2 (narrow):  `<DomainTable.Root><DomainTable.DefaultLayout>`
 *     `<DomainTable.CreateAction render={<HostButton />} />` ...
 * - Tier 3 (structural): compose `Header` / `Refresh` / `Content` freely, interleaving host UI.
 * - Tier 4 (headless): `useDomainTableModel(options)` — see index re-export.
 *
 * @module domain-table.composable
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import {
  DomainTable as DomainTableDefault,
  DomainTableView,
} from '@/components/auth0/my-organization/domain-table';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createComponentContext, mergeRenderProp } from '@/lib/composability';
import { cn } from '@/lib/utils';
import type {
  DomainTableProps,
  UseDomainTableReturn,
} from '@/types/my-organization/domain-management/domain-table-types';

/** Value shared from `Root` to every compound part. */
interface DomainTableComposition {
  model: UseDomainTableReturn;
  props: DomainTableProps;
}

const [DomainTableContext, useDomainTableContext] =
  createComponentContext<DomainTableComposition>('DomainTable');

const DEFAULT_STYLING: NonNullable<DomainTableProps['styling']> = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/** Props for {@link Root}. Mirrors {@link DomainTableProps} plus children. */
export interface DomainTableRootProps extends DomainTableProps {
  children?: React.ReactNode;
}

/**
 * Composition boundary. Runs the model hook once and shares it with all
 * compound parts, then wraps children in the themed scope + loading gate.
 * @param props - {@link DomainTableRootProps}
 * @returns The provider-wrapped subtree.
 */
function Root({ children, ...props }: DomainTableRootProps) {
  useTelemetry('domain-management');

  const {
    customMessages = {},
    styling = DEFAULT_STYLING,
    readOnly = false,
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
  } = props;

  const model = useDomainTable({
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
  });

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const composition = React.useMemo<DomainTableComposition>(
    () => ({ model, props: { ...props, styling, readOnly, customMessages } }),
    [model, props, styling, readOnly, customMessages],
  );

  return (
    <DomainTableContext.Provider value={composition}>
      <GateKeeper isLoading={model.isFetching} styling={styling}>
        <StyledScope style={currentStyles.variables}>{children}</StyledScope>
      </GateKeeper>
    </DomainTableContext.Provider>
  );
}

Root.displayName = 'DomainTable.Root';

/** Props for {@link CreateAction}. */
export interface DomainTableCreateActionProps {
  /** Host element to render in place of the default UIC button. */
  render?: React.ReactElement;
}

/**
 * The create-domain trigger. Renders the default UIC button, or a
 * host-supplied element via `render`, wired to the model's create command.
 * Disabled state follows the same rules as the Tier-1 header button.
 * @param props - {@link DomainTableCreateActionProps}
 * @returns The create action element.
 */
function CreateAction({ render }: DomainTableCreateActionProps) {
  const { model, props } = useDomainTableContext();
  const { t } = useTranslator('domain_management', props.customMessages);

  const label = t('domain_table.header.create_button_text');
  const disabled =
    Boolean(props.createAction?.disabled) || Boolean(props.readOnly) || model.isFetching;
  const onClick = () => model.handleCreateClick();

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

CreateAction.displayName = 'DomainTable.CreateAction';

/** Props for {@link DomainTableHeader}. */
export interface DomainTableHeaderProps {
  /** Action node rendered in the header's action region. Defaults to {@link CreateAction}. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Title/description region. Owns the header copy; the action region defaults to
 * {@link CreateAction} but can be replaced by the host.
 * @param props - {@link DomainTableHeaderProps}
 * @returns The header element.
 */
function DomainTableHeader({ action, className }: DomainTableHeaderProps) {
  const { props } = useDomainTableContext();
  const { t } = useTranslator('domain_management', props.customMessages);

  return (
    <div className={cn(props.styling?.classes?.['DomainTable-header'], className)}>
      <Header
        title={t('domain_table.header.title')}
        description={t('domain_table.header.description')}
        actionSlot={action ?? <CreateAction />}
      />
    </div>
  );
}

DomainTableHeader.displayName = 'DomainTable.Header';

/** Props for {@link Refresh}. */
export interface DomainTableRefreshProps {
  className?: string;
}

/**
 * The last-updated / manual-refresh control. Movable — hosts place it before or
 * after {@link Content} in a structural layout.
 * @param props - {@link DomainTableRefreshProps}
 * @returns The refresh control.
 */
function Refresh({ className }: DomainTableRefreshProps) {
  const { model, props } = useDomainTableContext();
  return (
    <div
      className={cn(
        'flex justify-end mb-8',
        props.styling?.classes?.['DomainTable-tableActions'],
        className,
      )}
    >
      <RefreshIndicator
        isStale={model.isDomainsStale}
        isFetching={model.isRefetchingDomains}
        lastUpdatedAt={model.domainsUpdatedAt || undefined}
        onRefresh={model.refetchDomains}
      />
    </div>
  );
}

Refresh.displayName = 'DomainTable.Refresh';

/**
 * The table body (data table + row actions + modals). Reuses the existing view
 * with its header and refresh regions suppressed, since those are owned by the
 * {@link DomainTableHeader} and {@link Refresh} parts in composition.
 * @returns The table content.
 */
function Content() {
  const { model, props } = useDomainTableContext();
  return (
    <DomainTableView
      domainTable={model}
      schema={props.schema}
      styling={props.styling ?? DEFAULT_STYLING}
      hideHeader
      hideRefresh
      readOnly={Boolean(props.readOnly)}
      customMessages={props.customMessages}
      createAction={props.createAction}
      onOpenProvider={props.onOpenProvider}
      onCreateProvider={props.onCreateProvider}
    />
  );
}

Content.displayName = 'DomainTable.Content';

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
      <DomainTableHeader action={children} />
      <Refresh />
      <Content />
    </>
  );
}

DefaultLayout.displayName = 'DomainTable.DefaultLayout';

/**
 * Organization domains table with progressive composability.
 *
 * Callable directly for the Tier-1 default (`<DomainTable {...props} />`),
 * and exposes compound parts for narrow (Tier 2) and structural (Tier 3)
 * composition. For fully headless (Tier 4) usage, see `useDomainTableModel`.
 *
 * @example Tier 2 — replace the create button
 * ```tsx
 * <DomainTable.Root {...props}>
 *   <DomainTable.DefaultLayout>
 *     <DomainTable.CreateAction render={<HostButton>Add domain</HostButton>} />
 *   </DomainTable.DefaultLayout>
 * </DomainTable.Root>
 * ```
 *
 * @example Tier 3 — structural layout with host UI interleaved
 * ```tsx
 * <DomainTable.Root {...props}>
 *   <DomainTable.Header action={<DomainTable.CreateAction render={<HostButton />} />} />
 *   <HostGuidancePanel />
 *   <DomainTable.Content />
 *   <DomainTable.Refresh />
 * </DomainTable.Root>
 * ```
 */
const DomainTable = Object.assign(DomainTableDefault, {
  Root,
  DefaultLayout,
  Header: DomainTableHeader,
  CreateAction,
  Refresh,
  Content,
});

export {
  DomainTable,
  Root,
  DefaultLayout,
  DomainTableHeader as Header,
  CreateAction,
  Refresh,
  Content,
  useDomainTableContext,
};
