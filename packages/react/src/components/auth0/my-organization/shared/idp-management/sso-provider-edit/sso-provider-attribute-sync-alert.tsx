/**
 * SSO provider attribute sync confirmation alert.
 * @module sso-provider-attribute-sync-alert
 * @internal
 */

import { AlertTriangle } from 'lucide-react';
import * as React from 'react';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
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

/**
 * Alert component for SSO provider attribute sync.
 *
 * @param props - Component props.
 * @param props.translatorKey - i18n translation key namespace.
 * @param props.classes - CSS class overrides for sub-elements.
 * @param props.style - CSS variables computed by the parent.
 * @param props.customMessages - Custom i18n message overrides.
 * @param props.onSync - Callback when sync is triggered.
 * @param props.isSyncing - Whether sync is in progress.
 * @param props.canSync - Whether the user may trigger a sync.
 * @param props.permissionDenied - Whether a missing scope is the reason a sync is unavailable.
 * @returns Attribute sync alert component.
 * @internal
 */
export function SsoProviderAttributeSyncAlert({
  translatorKey = 'idp_management.edit_sso_provider.tabs.sso.content.attribute_sync_alert',
  classes,
  style,
  customMessages,
  onSync,
  isSyncing = false,
  canSync = true,
  permissionDenied = false,
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
      <Alert
        variant="warning"
        className={cn(
          'flex items-center justify-between',
          classes?.['SsoProviderAttributeSyncAlert-root'],
        )}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div>
            <AlertTitle>{t('title')}</AlertTitle>
            <AlertDescription>{t('description')}</AlertDescription>
          </div>
        </div>
        <PermissionDeniedTooltip enabled={permissionDenied}>
          <Button
            variant="outline"
            size="default"
            onClick={handleSyncClick}
            disabled={isSyncing || !canSync}
          >
            {t('sync_button_label')}
          </Button>
        </PermissionDeniedTooltip>
      </Alert>

      <Dialog open={isSyncModalOpen} onOpenChange={setIsSyncModalOpen}>
        <DialogContent
          style={style}
          className={classes?.['SsoProviderAttributeSyncAlert-dialogContent']}
        >
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
            <Button onClick={handleConfirmSync} disabled={isSyncing || !canSync}>
              {t('sync_modal.actions.proceed_button_label')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
