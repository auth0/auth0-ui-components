import type { ProvisioningManageTokenMessages } from '@auth0-web-ui-components/core';
import { Copy } from 'lucide-react';
import * as React from 'react';

import { Modal } from '../../../components/ui/modal';
import { useTranslator } from '../../../hooks';

import { ProvisioningCreateTokenModalContent } from './provisioning-create-token-modal-content';

interface ProvisioningCreateTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdToken: {
    token: string;
    tokenId: string;
  } | null;
  customMessages?: Partial<ProvisioningManageTokenMessages>;
}

export function ProvisioningCreateTokenModal({
  open,
  onOpenChange,
  createdToken,
  customMessages = {},
}: ProvisioningCreateTokenModalProps): React.JSX.Element {
  const { t } = useTranslator('provisioning_management.manage_tokens', customMessages);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('create_modal.title')}
      content={
        createdToken && (
          <ProvisioningCreateTokenModalContent
            token={createdToken.token}
            tokenId={createdToken.tokenId}
          />
        )
      }
      modalActions={{
        showPrevious: false,
        showUnsavedChanges: false,
        nextAction: {
          type: 'button',
          label: t('create_modal.copy_and_close_button_label'),
          variant: 'primary',
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            if (createdToken) {
              navigator.clipboard.writeText(createdToken.token);
            }
            onOpenChange(false);
          },
        },
      }}
    />
  );
}
