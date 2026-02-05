import React from 'react';

import { ProvisioningDeleteTokenModalContent } from './provisioning-delete-token-modal-content';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ProvisioningDeleteTokenModalProps } from '@/types/my-organization/idp-management/sso-provisioning/provisioning-manage-token-types';

export function ProvisioningDeleteTokenModal({
  open,
  onOpenChange,
  tokenId,
  onConfirm,
  isLoading,
  customMessages,
}: ProvisioningDeleteTokenModalProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.manage_tokens',
    customMessages,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('delete_modal.title', { tokenId: tokenId || '' })}
      content={
        <ProvisioningDeleteTokenModalContent
          tokenId={tokenId || ''}
          customMessages={customMessages?.content}
        />
      }
      modalActions={{
        isLoading,
        showUnsavedChanges: false,
        previousAction: {
          type: 'button',
          label: t('delete_modal.cancel_button_label'),
          variant: 'outline',
          disabled: isLoading,
          onClick: () => onOpenChange(false),
        },
        nextAction: {
          type: 'button',
          label: t('delete_modal.delete_button_label'),
          variant: 'destructive',
          disabled: isLoading,
          onClick: onConfirm,
        },
      }}
    />
  );
}
