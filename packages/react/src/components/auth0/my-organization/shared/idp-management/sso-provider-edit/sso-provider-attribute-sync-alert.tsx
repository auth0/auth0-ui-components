import { AlertTriangle } from 'lucide-react';
import * as React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderAttributeSyncAlertProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

export function SsoProviderAttributeSyncAlert({
  translatorKey = 'idp_management.edit_sso_provider.tabs.sso.content.attribute_sync_alert',
  className,
  customMessages,
  onSync,
  isSyncing = false,
}: SsoProviderAttributeSyncAlertProps) {
  const [isSyncModalOpen, setIsSyncModalOpen] = React.useState(false);

  const { t } = useTranslator(translatorKey, customMessages);

  const handleSyncClick = () => {
    setIsSyncModalOpen(true);
  };

  const handleConfirmSync = async () => {
    if (onSync) {
      await onSync();
    }
    setIsSyncModalOpen(false);
  };

  return (
    <>
      <Alert variant="warning" className={cn('flex items-center justify-between', className)}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div>
            <AlertTitle>{t('title')}</AlertTitle>
            <AlertDescription>{t('description')}</AlertDescription>
          </div>
        </div>
        {
          <Button variant="outline" size="default" onClick={handleSyncClick} disabled={isSyncing}>
            {t('sync_button_label')}
          </Button>
        }
      </Alert>

      <Dialog open={isSyncModalOpen} onOpenChange={setIsSyncModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sync_modal.title')}</DialogTitle>
            <DialogDescription>{t('sync_modal.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSyncModalOpen(false)}
              disabled={isSyncing}
            >
              {t('sync_modal.actions.cancel_button_label')}
            </Button>
            <Button onClick={handleConfirmSync} disabled={isSyncing}>
              {t('sync_modal.actions.proceed_button_label')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
