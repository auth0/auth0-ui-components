/**
 * SSO domain tab table action column.
 * @module sso-domain-tab-action-column
 * @internal
 */

import { CircleMinus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import {
  getAssociationBlockReason,
  getAssociationBlockReasonMessages,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { useId } from '@/lib/utils/use-id-compat';
import type { SsoDomainTabActionColumn } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

/**
 * SsoDomainTabActionsColumn component
 * Handles the actions column for SSO provider edit on domain tab table
 * with a remove button that dissociates the domain from the identity provider
 * @param props - Component props.
 * @param props.translatorKey - Translation namespace key
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.permissions - What the current user is allowed to do
 * @param props.domain - Domain object or domain name
 * @param props.idpName - Name of the identity provider, shown in the tooltip
 * @param props.isUpdating - Whether an update operation is in progress
 * @param props.isUpdatingId - ID of the item currently being updated
 * @param props.onRemove - Callback fired when the domain is removed
 * @param props.lockLastDomain - Whether the provider's last verified domain must stay associated
 * @param props.canManageProviderDomains - Whether the organization's access level allows changing the provider's domains
 * @param props.readOnly - Whether the component is in read-only mode
 * @returns JSX element
 */
export function SsoDomainTabActionsColumn({
  translatorKey = 'idp_management.edit_sso_provider.tabs.domains',
  customMessages = {},
  permissions,
  domain,
  idpName,
  isUpdating,
  isUpdatingId,
  onRemove,
  lockLastDomain = false,
  canManageProviderDomains = true,
  readOnly = false,
}: SsoDomainTabActionColumn) {
  const { t } = useTranslator(translatorKey, customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);
  const disabledReasonId = useId();

  if (readOnly) return null;

  if (isUpdating && isUpdatingId === domain.id) {
    return (
      <div className="flex items-center justify-end gap-4 min-w-0">
        <Spinner size="sm" />
      </div>
    );
  }

  const blockReason = getAssociationBlockReason({
    hasPermission: permissions.canDissociateDomain,
    isProviderAccessRestricted: !canManageProviderDomains,
    isAssociationUnavailable: false,
    isLastDomainLocked: lockLastDomain,
  });
  const disabledReason = blockReason
    ? getAssociationBlockReasonMessages(t, tCommon)[blockReason]
    : null;
  const removeLabel = t('table.actions.remove_domain_aria_label', { domain: domain.domain });
  const tooltip =
    disabledReason ??
    (idpName ? t('table.actions.remove_domain_tooltip', { idp: idpName }) : removeLabel);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={disabledReason ? 0 : undefined}
            className={cn(
              disabledReason &&
                'rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring',
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-destructive-foreground/30 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20"
              disabled={!!blockReason || isUpdating}
              onClick={() => onRemove(domain)}
              aria-label={removeLabel}
              aria-describedby={disabledReason ? disabledReasonId : undefined}
            >
              <CircleMinus aria-hidden="true" />
            </Button>
            {disabledReason && (
              <span id={disabledReasonId} className="sr-only">
                {disabledReason}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}
