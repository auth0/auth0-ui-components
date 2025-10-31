import * as React from 'react';

import { Modal } from '../../../../components/ui/modal';
import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { SsoProviderRemoveFromOrgModalProps } from '../../../../types/my-org/idp-management/sso-provider/sso-provider-delete-types';
import { SsoProviderDeleteModalContent } from '../sso-provider-delete/provider-delete-modal-content';

export function SsoProviderRemoveFromOrgModal({
  className,
  isOpen,
  onClose,
  provider,
  organizationName,
  onRemove,
  isLoading = false,
  customMessages = {},
}: SsoProviderRemoveFromOrgModalProps) {
  const { t } = useTranslator('idp_management.remove_sso_provider', customMessages);
  const [confirmationText, setConfirmationText] = React.useState('');

  const handleModalContentChange = React.useCallback((field: string, value: string) => {
    setConfirmationText(value);
  }, []);

  const handleRemove = React.useCallback(async () => {
    if (provider) {
      await onRemove(provider);
      onClose();
    }
  }, [onRemove, provider, onClose]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  React.useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn('p-10', className)}
      title={t('modal.title', {
        providerName: provider.name,
        organizationName: organizationName,
      })}
      content={
        <div className="space-y-6">
          <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph)')}>
            {t('modal.description', { providerName: provider.name })}
          </p>

          <SsoProviderDeleteModalContent
            onChange={handleModalContentChange}
            customMessages={customMessages.modal?.content}
          />
        </div>
      }
      modalActions={{
        nextAction: {
          type: 'button',
          label: t('modal.actions.remove_button_text'),
          onClick: handleRemove,
          variant: 'destructive',
          disabled: isLoading || confirmationText !== provider.name,
        },
        previousAction: {
          label: t('modal.actions.cancel_button_text'),
          onClick: onClose,
        },
      }}
    />
  );
}
