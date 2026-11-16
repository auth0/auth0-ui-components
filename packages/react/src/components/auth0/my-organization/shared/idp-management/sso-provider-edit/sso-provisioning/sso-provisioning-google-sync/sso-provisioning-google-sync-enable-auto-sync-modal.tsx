/**
 * Google Workspace enable auto sync modal.
 * @module sso-provisioning-google-sync-enable-auto-sync-modal
 * @internal
 */

import * as React from 'react';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoProvisioningGoogleSyncEnableAutoSyncModalProps } from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

/**
 * Modal shown once Google access is granted, offering to turn on automatic synchronization.
 * Closing it any other way than confirming leaves automatic synchronization off.
 *
 * @param props - Component props.
 * @param props.open - Whether the modal is open.
 * @param props.isLoading - Whether automatic synchronization is being enabled.
 * @param props.onDismiss - Callback when the modal is dismissed.
 * @param props.onConfirm - Callback to enable automatic synchronization.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.className - Optional class name.
 * @returns The enable auto sync modal.
 * @internal
 */
export function SsoProvisioningGoogleSyncEnableAutoSyncModal({
  open,
  isLoading,
  onDismiss,
  onConfirm,
  customMessages,
  className,
}: SsoProvisioningGoogleSyncEnableAutoSyncModalProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.google_workspace.modals.enable_auto_sync',
    customMessages,
  );

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onDismiss();
      }}
      title={t('title')}
      className={className}
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground text-paragraph">{t('content.description_enabled')}</p>
          <p className="text-muted-foreground text-paragraph">{t('content.description_skip')}</p>
        </div>
      }
      modalActions={{
        isLoading,
        showUnsavedChanges: false,
        previousAction: {
          type: 'button',
          label: t('actions.dismiss_button_label'),
          variant: 'outline',
          disabled: isLoading,
          onClick: onDismiss,
        },
        nextAction: {
          type: 'button',
          label: t('actions.confirm_button_label'),
          variant: 'primary',
          disabled: isLoading,
          onClick: onConfirm,
        },
      }}
    />
  );
}
