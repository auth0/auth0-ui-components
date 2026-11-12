/**
 * "Use for discovery" switch for a domain table row.
 * @module domain-discovery-switch
 * @internal
 */

import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { DomainDiscoverySwitchProps } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * DomainDiscoverySwitch Component
 * @param props - Component props.
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.domain - The domain row
 * @param props.checked - Whether discovery is on for the domain
 * @param props.isLocked - Whether the discovery policy allows a single value
 * @param props.canChange - Whether the user may change discovery
 * @param props.isUpdating - Whether this row is being updated
 * @param props.onToggle - Callback fired when the user flips the switch
 * @returns JSX element
 */
export function DomainDiscoverySwitch({
  customMessages = {},
  domain,
  checked,
  isLocked,
  canChange,
  isUpdating,
  onToggle,
}: DomainDiscoverySwitchProps) {
  const { t } = useTranslator('domain_management', customMessages);
  const disabledReasonId = React.useId();

  const isVerified = domain.status === 'verified';

  const getDisabledReason = () => {
    if (!canChange) return t('domain_table.table.discovery.permission_tooltip');
    if (isLocked) return t('domain_table.table.discovery.locked_tooltip');
    if (!isVerified) return t('domain_table.table.discovery.unverified_tooltip');
    return null;
  };
  const disabledReason = getDisabledReason();

  const handleToggle = React.useCallback(
    (value: boolean) => {
      void onToggle(domain, value);
    },
    [domain, onToggle],
  );

  // The row opens the domain on click, so the switch must not trigger it.
  const stopRowClick = (event: React.SyntheticEvent) => event.stopPropagation();

  if (isUpdating) {
    return (
      <div
        role="status"
        className="flex items-center"
        onClick={stopRowClick}
        onKeyDown={stopRowClick}
      >
        <Spinner size="sm" />
      </div>
    );
  }

  const isSwitchDisabled = !!disabledReason;
  const describedBy = disabledReason ? disabledReasonId : undefined;
  const switchLabel = t('domain_table.table.discovery.switch_label', { domainName: domain.domain });

  const control = (
    <span
      tabIndex={disabledReason ? 0 : undefined}
      className={cn(
        disabledReason && 'rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring',
      )}
    >
      <Switch
        checked={checked}
        onCheckedChange={handleToggle}
        disabled={isSwitchDisabled}
        aria-label={switchLabel}
        aria-describedby={describedBy}
      />
      {disabledReason && (
        <span id={disabledReasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
    </span>
  );

  return (
    <div
      role="presentation"
      className="flex items-center"
      onClick={stopRowClick}
      onKeyDown={stopRowClick}
    >
      {disabledReason ? (
        <Tooltip>
          <TooltipTrigger asChild>{control}</TooltipTrigger>
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        control
      )}
    </div>
  );
}
