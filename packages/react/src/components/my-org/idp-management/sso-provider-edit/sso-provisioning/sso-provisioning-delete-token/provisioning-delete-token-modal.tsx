import React from 'react';

import { useTranslator } from '../../../../../../hooks/use-translator';
import type { ProvisioningDeleteTokenModalProps } from '../../../../../../types/my-org/idp-management/sso-provisioning/provisioning-manage-token-types';
import { Modal } from '../../../../../ui/modal';

import { ProvisioningDeleteTokenModalContent } from './provisioning-delete-token-modal-content';

export function ProvisioningDeleteTokenModal({
  open,
  onOpenChange,
  tokenId,
  onConfirm,
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
        showUnsavedChanges: false,
        previousAction: {
          type: 'button',
          label: t('delete_modal.cancel_button_label'),
          variant: 'outline',
          onClick: () => onOpenChange(false),
        },
        nextAction: {
          type: 'button',
          label: t('delete_modal.delete_button_label'),
          variant: 'destructive',
          onClick: onConfirm,
        },
      }}
    />
  );
}
