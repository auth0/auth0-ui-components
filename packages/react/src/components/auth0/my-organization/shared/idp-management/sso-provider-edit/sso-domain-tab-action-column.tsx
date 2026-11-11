/**
 * SSO domain tab table action column.
 * @module sso-domain-tab-action-column
 * @internal
 */

import { DEFAULT_DOMAIN_VERIFICATION_MODE } from '@auth0/universal-components-core';
import * as React from 'react';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ASSOCIATION_BLOCK_REASONS,
  type AssociationBlockReason,
} from '@/lib/constants/my-organization/domain-management/domain-management-constants';
import {
  getAssociationBlockReason,
  isDomainAssociationUnavailable,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type { SsoDomainTabActionColumn } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

/**
 * SsoDomainTabActionsColumn component
 * Handles the actions column for SSO provider edit on domain tab table
 * with enable/disable toggle and verify button
 * @param props - Component props.
 * @param props.translatorKey - Translation namespace key
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.permissions - What the current user is allowed to do
 * @param props.idpDomains - Identity provider domains
 * @param props.domain - Domain object or domain name
 * @param props.handleVerify - Handler function for domain verification
 * @param props.isUpdating - Whether an update operation is in progress
 * @param props.isUpdatingId - ID of the item currently being updated
 * @param props.onToggle - Callback fired when toggle state changes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.domainVerificationMode - How identity providers use verified domains
 * @param props.lockLastDomain - Whether the provider's last verified domain must stay associated
 * @param props.canManageProviderDomains - Whether the organization's access level allows changing the provider's domains
 * @returns JSX element
 */
export function SsoDomainTabActionsColumn({
  translatorKey = 'idp_management.edit_sso_provider.tabs.domains',
  customMessages = {},
  permissions,
  idpDomains,
  domain,
  handleVerify,
  isUpdating,
  isUpdatingId,
  onToggle,
  readOnly = false,
  domainVerificationMode = DEFAULT_DOMAIN_VERIFICATION_MODE,
  lockLastDomain = false,
  canManageProviderDomains = true,
}: SsoDomainTabActionColumn) {
  const { t } = useTranslator(translatorKey, customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);
  const disabledReasonId = React.useId();

  const providerHasDomain = idpDomains.includes(domain.id);
  const isVerifyForbidden = !readOnly && !permissions.canVerifyDomain;

  const hasPermission = providerHasDomain
    ? permissions.canDissociateDomain
    : permissions.canAssociateDomain;
  const isAssociationUnavailable = isDomainAssociationUnavailable(domainVerificationMode);
  const isLastDomainLocked = lockLastDomain && providerHasDomain;

  const blockReason = getAssociationBlockReason({
    hasPermission,
    isProviderAccessRestricted: !canManageProviderDomains,
    isAssociationUnavailable,
    isLastDomainLocked,
  });
  const blockReasonMessages: Record<AssociationBlockReason, string> = {
    [ASSOCIATION_BLOCK_REASONS.FORBIDDEN]: tCommon('error.forbidden'),
    [ASSOCIATION_BLOCK_REASONS.ACCESS_RESTRICTED]: t(
      'table.actions.provider_access_restricted_tooltip',
    ),
    [ASSOCIATION_BLOCK_REASONS.ASSOCIATION_UNAVAILABLE]: t(
      'table.actions.domain_association_unavailable_tooltip',
    ),
    [ASSOCIATION_BLOCK_REASONS.LAST_DOMAIN]: t('table.actions.last_verified_domain_tooltip'),
  };
  const disabledReason = blockReason ? blockReasonMessages[blockReason] : null;

  const toggleLabel = providerHasDomain
    ? t('table.actions.disable_domain_tooltip')
    : t('table.actions.enable_domain_tooltip');
  const isToggleDisabled = !!blockReason || isUpdating;
  const describedBy = disabledReason ? disabledReasonId : undefined;

  const domainToggle = (
    <span>
      <Switch
        checked={providerHasDomain}
        onCheckedChange={(checked) => onToggle(domain, checked)}
        disabled={isToggleDisabled}
        aria-label={toggleLabel}
        aria-describedby={describedBy}
      />
      {disabledReason && (
        <span id={disabledReasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
    </span>
  );

  if (isUpdating && isUpdatingId === domain.id) {
    return (
      <div className="flex items-center justify-end gap-4 min-w-0">
        <Spinner size="sm" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      {domain.status === 'verified' ? (
        readOnly ? (
          domainToggle
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>{domainToggle}</TooltipTrigger>
            <TooltipContent>{disabledReason ?? toggleLabel}</TooltipContent>
          </Tooltip>
        )
      ) : (
        <PermissionDeniedTooltip customMessages={customMessages} enabled={isVerifyForbidden}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVerify(domain)}
            disabled={!permissions.canVerifyDomain}
          >
            {t('table.columns.verify')}
          </Button>
        </PermissionDeniedTooltip>
      )}
    </div>
  );
}
