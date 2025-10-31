import type { SharedComponentProps } from '@auth0/web-ui-components-core';
import { AlertTriangle } from 'lucide-react';

import { useTranslator } from '../../../../../hooks/use-translator';
import { cn } from '../../../../../lib/theme-utils';
import { Alert, AlertDescription, AlertTitle } from '../../../../ui/alert';

interface ProvisioningWarningAlertProps extends SharedComponentProps {
  className?: string;
}

export function ProvisioningWarningAlert({
  className,
  customMessages,
}: ProvisioningWarningAlertProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.warning_alert_message',
    customMessages,
  );
  return (
    <Alert variant="warning" className={cn(className)}>
      <AlertTriangle />
      <AlertTitle> {t('title')}</AlertTitle>
      <AlertDescription>{t('description')}</AlertDescription>
    </Alert>
  );
}
