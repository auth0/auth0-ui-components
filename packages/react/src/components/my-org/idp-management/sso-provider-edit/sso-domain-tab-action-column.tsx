import React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import type { SsoDomainTabActionColumn } from '../../../../types/my-org/idp-management/sso-domain/sso-domain-tab-types';
import { Button } from '../../../ui/button';
import { Switch } from '../../../ui/switch';

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
  onToggle,
}: SsoDomainTabActionColumn) {
  const { t } = useTranslator(translatorKey, customMessages);

  const providerHasDomain = idpDomains.includes(domain.id);

  return (
    <div className="flex items-center justify-end gap-4 min-w-0">
      {domain.status === 'verified' ? (
        <Switch
          checked={providerHasDomain}
          onCheckedChange={(checked) => onToggle(domain, checked)}
          disabled={readOnly || isUpdating}
        />
      ) : (
        <Button variant="outline" onClick={() => handleVerify(domain)}>
          {t('table.columns.verify')}
        </Button>
      )}
    </div>
  );
}
