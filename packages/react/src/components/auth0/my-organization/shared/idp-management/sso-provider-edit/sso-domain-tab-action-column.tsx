import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoDomainTabActionColumn } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

/**
 * SsoDomainTabActionsColumn component
 * Handles the actions column for SSO provider edit on domain tab table
 * with enable/disable toggle and verify button
 */
export function SsoDomainTabActionsColumn({
  translatorKey = 'idp_management.edit_sso_provider.tabs.domains',
  customMessages = {},
  readOnly,
  idpDomains,
  domain,
  handleVerify,
  isUpdating,
  isUpdatingId,
  onToggle,
}: SsoDomainTabActionColumn) {
  const { t } = useTranslator(translatorKey, customMessages);

  const providerHasDomain = idpDomains.includes(domain.id);

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Switch
              checked={providerHasDomain}
              onCheckedChange={(checked) => onToggle(domain, checked)}
              disabled={readOnly || isUpdating}
            />
          </TooltipTrigger>
          <TooltipContent>
            {providerHasDomain
              ? t('content.table.actions.disable_domain_tooltip')
              : t('content.table.actions.enable_domain_tooltip')}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button variant="outline" size="sm" onClick={() => handleVerify(domain)}>
          {t('table.columns.verify')}
        </Button>
      )}
    </div>
  );
}
