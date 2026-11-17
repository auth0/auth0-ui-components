/**
 * Google Workspace provisioning disable modal.
 * @module sso-provisioning-google-sync-disable-modal
 * @internal
 */

import * as React from 'react';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoProvisioningGoogleSyncDisableModalProps } from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

/**
 * Modal confirming that Google Workspace directory provisioning should be disabled.
 *
 * @param props - Component props.
 * @param props.open - Whether the modal is open.
 * @param props.isLoading - Whether provisioning is being disabled.
 * @param props.onOpenChange - Callback when the open state changes.
 * @param props.onConfirm - Callback to disable provisioning.
 * @param props.customMessages - Custom translation messages to override defaults.
 * @param props.className - Optional class name.
 * @returns The disable modal.
 * @internal
 */
export function SsoProvisioningGoogleSyncDisableModal({
  open,
  isLoading,
  onOpenChange,
  onConfirm,
  customMessages,
  className,
}: SsoProvisioningGoogleSyncDisableModalProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.google_workspace.modals.disable',
    customMessages,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      className={className}
      content={<p className="text-muted-foreground text-paragraph">{t('content.description')}</p>}
      modalActions={{
        isLoading,
        showUnsavedChanges: false,
        previousAction: {
          type: 'button',
          label: t('actions.cancel_button_label'),
          variant: 'outline',
          disabled: isLoading,
          onClick: () => onOpenChange(false),
        },
        nextAction: {
          type: 'button',
          label: t('actions.confirm_button_label'),
          variant: 'destructive',
          disabled: isLoading,
          onClick: onConfirm,
        },
      }}
    />
  );
}
