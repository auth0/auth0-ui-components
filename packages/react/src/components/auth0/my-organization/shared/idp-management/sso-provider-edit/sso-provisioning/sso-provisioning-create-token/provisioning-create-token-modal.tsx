import { Copy } from 'lucide-react';
import * as React from 'react';

import { ProvisioningCreateTokenModalContent } from './provisioning-create-token-modal-content';

import { Modal } from '@/components/auth0/shared/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ProvisioningCreateTokenModalProps } from '@/types/my-organization/idp-management/sso-provisioning/provisioning-manage-token-types';

export function ProvisioningCreateTokenModal({
  open,
  onOpenChange,
  createdToken,
  isLoading,
  customMessages = {},
}: ProvisioningCreateTokenModalProps): React.JSX.Element {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.manage_tokens',
    customMessages,
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('create_modal.title')}
      content={
        createdToken && (
          <ProvisioningCreateTokenModalContent
            token={createdToken.token!}
            tokenId={createdToken.token_id}
            customMessages={customMessages.content}
          />
        )
      }
      modalActions={{
        isLoading,
        showPrevious: false,
        showUnsavedChanges: false,
        nextAction: {
          type: 'button',
          label: t('create_modal.copy_and_close_button_label'),
          variant: 'primary',
          icon: <Copy className="w-4 h-4" />,
          disabled: isLoading,
          onClick: () => {
            if (createdToken) {
              navigator.clipboard.writeText(createdToken.token!);
            }
            onOpenChange(false);
          },
        },
      }}
    />
  );
}
