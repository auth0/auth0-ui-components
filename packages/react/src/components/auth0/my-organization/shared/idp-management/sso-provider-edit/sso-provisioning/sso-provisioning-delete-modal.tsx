/**
 * SSO provisioning delete confirmation modal.
 * @module sso-provisioning-delete-modal
 * @internal
 */

import React from 'react';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProvisioningDeleteModalProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

/**
 *
 * @param props - Component props.
 * @param props.open - Whether the component is open/visible
 * @param props.onOpenChange - Callback fired when open state changes
 * @param props.onConfirm - Callback fired when the action is confirmed
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function SsoProvisioningDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  customMessages,
}: SsoProvisioningDeleteModalProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.delete',
    customMessages,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('modal.title')}
      content={
        <div className={cn('space-y-4')}>
          <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph)')}>
            {t('modal.content.description')}
          </p>
        </div>
      }
      modalActions={{
        isLoading,
        showUnsavedChanges: false,
        previousAction: {
          type: 'button',
          label: t('modal.actions.cancel_button_label'),
          variant: 'outline',
          disabled: isLoading,
          onClick: () => onOpenChange(false),
        },
        nextAction: {
          type: 'button',
          label: t('modal.actions.delete_button_label'),
          variant: 'destructive',
          disabled: isLoading,
          onClick: onConfirm,
        },
      }}
    />
  );
}
