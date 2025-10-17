import type { ProvisioningManageTokenMessages } from '@auth0-web-ui-components/core';
import * as React from 'react';

import { Modal } from '../../../components/ui/modal';
import { useTranslator } from '../../../hooks';

import { ProvisioningDeleteTokenModalContent } from './provisioning-delete-token-modal-content';

interface ProvisioningDeleteTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string | null;
  onConfirm: () => void;
  customMessages?: Partial<ProvisioningManageTokenMessages>;
}

export function ProvisioningDeleteTokenModal({
  open,
  onOpenChange,
  tokenId,
  onConfirm,
  customMessages = {},
}: ProvisioningDeleteTokenModalProps): React.JSX.Element {
  const { t } = useTranslator('provisioning_management.manage_tokens', customMessages);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('delete_modal.title', { tokenId: tokenId || '' })}
      content={<ProvisioningDeleteTokenModalContent tokenId={tokenId || ''} />}
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
