/** @module organization-switcher */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Building2, Check, ChevronsUpDown, Plus, RefreshCcw } from 'lucide-react';
import * as React from 'react';

import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOrganizationSwitcher } from '@/hooks/my-account/use-organization-switcher';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  OrganizationSwitcherProps,
  OrganizationSwitcherViewProps,
} from '@/types/my-account/organization-management/organization-switcher-types';

/**
 * OrganizationSwitcher container component.
 * @param props - Component props
 * @returns Organization switcher container element
 * @internal
 */
function OrganizationSwitcher(props: OrganizationSwitcherProps) {
  useTelemetry('organization-switcher');

  const {
    currentOrganizationId,
    currentOrganizationName,
    onSwitchOrganization,
    onCreateOrganization,
    pageSize,
    readOnly = false,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  } = props;

  const organizationSwitcher = useOrganizationSwitcher({
    currentOrganizationId,
    onSwitchOrganization,
    pageSize,
  });

  // The switcher stays hidden while loading, so the compact control never becomes a full-size loader.
  return (
    <GateKeeper styling={styling}>
      <OrganizationSwitcherView
        organizationSwitcher={organizationSwitcher}
        currentOrganizationId={currentOrganizationId}
        currentOrganizationName={currentOrganizationName}
        styling={styling}
        customMessages={customMessages}
        readOnly={readOnly}
        onCreateOrganization={onCreateOrganization}
      />
    </GateKeeper>
  );
}

/**
 * OrganizationSwitcherView — Presentational component.
 * @param props - View props
 * @returns Organization switcher view element
 * @internal
 */
function OrganizationSwitcherView({
  organizationSwitcher,
  currentOrganizationId,
  currentOrganizationName,
  styling,
  customMessages,
  readOnly,
  onCreateOrganization,
}: OrganizationSwitcherViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.organization_switcher', customMessages);

  const {
    organizations,
    currentOrganization,
    isLoading,
    isError,
    isRetrying,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    handleSelect,
  } = organizationSwitcher;

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  // The list may not hold the current organization (loading failed, or it is on a later page).
  const currentName =
    currentOrganization?.display_name || currentOrganization?.name || currentOrganizationName;

  // Keep the menu open while paging or retrying.
  const keepOpen = (handler: () => void) => (event: Event) => {
    event.preventDefault();
    handler();
  };

  // Keep the error state on screen while a retry is in flight, so the control doesn't vanish.
  const hasFailed = isError || isRetrying;

  // Render nothing until the first page loads, and when there is nothing to switch to.
  const hasSingleOrganization = organizations.length <= 1 && !hasNextPage;
  if ((isLoading && !isRetrying) || (!hasFailed && hasSingleOrganization)) {
    return null;
  }

  return (
    <StyledScope style={currentStyles.variables}>
      <DropdownMenu>
        <DropdownMenuTrigger
          variant="outline"
          disabled={readOnly}
          aria-label={
            currentName
              ? t('trigger_label', { organizationName: currentName })
              : t('trigger_placeholder')
          }
          className={cn(
            'w-full justify-between gap-2',
            currentStyles.classes?.['OrganizationSwitcher-trigger'],
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentName || t('trigger_placeholder')}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          aria-label={t('menu_label')}
          className={cn('w-60', currentStyles.classes?.['OrganizationSwitcher-content'])}
        >
          {hasFailed ? (
            <>
              <p className="px-2 py-1.5 text-sm text-destructive-foreground">
                {t('error_message')}
              </p>
              <DropdownMenuItem disabled={isRetrying} onSelect={keepOpen(refetch)}>
                {isRetrying ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                {t('retry_button_text')}
              </DropdownMenuItem>
            </>
          ) : (
            // Five rows of 32px, as in the design; longer lists scroll.
            <div className="max-h-40 overflow-y-auto">
              {organizations.map((organization) => {
                const isCurrent = organization.id === currentOrganizationId;
                return (
                  <DropdownMenuItem
                    key={organization.id}
                    aria-current={isCurrent || undefined}
                    onSelect={() => handleSelect(organization.id)}
                    className="justify-between gap-2"
                  >
                    <TruncatedText text={organization.display_name || organization.name} />
                    {isCurrent && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </DropdownMenuItem>
                );
              })}
              {hasNextPage && (
                <DropdownMenuItem disabled={isFetchingNextPage} onSelect={keepOpen(fetchNextPage)}>
                  {isFetchingNextPage && <Spinner size="sm" className="mr-2" />}
                  {t('load_more_button_text')}
                </DropdownMenuItem>
              )}
            </div>
          )}
          {onCreateOrganization && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onCreateOrganization()}>
                <Plus className="mr-2 h-4 w-4" />
                {t('create_button_text')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </StyledScope>
  );
}

/**
 * Single-line label that shows its full text in a tooltip only when truncated.
 * @param props - Component props.
 * @param props.text - Label text
 * @returns JSX element
 * @internal
 */
function TruncatedText({ text }: { text: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [open, setOpen] = React.useState(false);

  // Stay controlled and only allow opening while the label overflows.
  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    const element = ref.current;
    setOpen(nextOpen && !!element && element.scrollWidth > element.clientWidth);
  }, []);

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <span ref={ref} className="truncate">
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Organization switcher.
 *
 * Compact control that shows the organization the user is signed in to and lets
 * them pick another organization they belong to (My Account API). Organizations
 * load a page at a time with "Load more". The switcher is hidden while loading and
 * when the user belongs to only one organization.
 * Requires the `read:me:organizations` scope on the My Account API token.
 *
 * @param props - {@link OrganizationSwitcherProps}
 * @param props.currentOrganizationId - ID of the organization the user is signed in to
 * @param props.currentOrganizationName - Name shown until the current organization is loaded
 * @param props.onSwitchOrganization - Called with the organization to switch to
 * @param props.onCreateOrganization - Shows a "Create Organization" item that calls this
 * @param props.pageSize - Organizations loaded per page
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Disable the switcher
 * @returns Organization switcher component
 *
 * @see {@link OrganizationSwitcherProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationSwitcher
 *   currentOrganizationId={user?.org_id}
 *   onSwitchOrganization={(org) => {
 *     // Cached tokens are not specific to an organization, so clear them first.
 *     void logout({ openUrl: false }).then(() =>
 *       loginWithRedirect({ authorizationParams: { organization: org.id } }),
 *     );
 *   }}
 * />
 * ```
 */
export { OrganizationSwitcher, OrganizationSwitcherView };
