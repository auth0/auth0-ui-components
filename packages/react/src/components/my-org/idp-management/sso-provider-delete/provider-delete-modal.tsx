import * as React from 'react';

import { Modal } from '../../../../components/ui/modal';
import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { SsoProviderDeleteModalProps } from '../../../../types/my-org/idp-management/sso-provider/sso-provider-delete-types';

import { SsoProviderDeleteModalContent } from './provider-delete-modal-content';

export function SsoProviderDeleteModal({
  className,
  isOpen,
  onClose,
  provider,
  onDelete,
  isLoading = false,
  customMessages = {},
}: SsoProviderDeleteModalProps) {
  const { t } = useTranslator('idp_management.delete_sso_provider', customMessages);
  const [confirmationText, setConfirmationText] = React.useState('');

  const handleModalContentChange = React.useCallback((field: string, value: string) => {
    setConfirmationText(value);
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (provider) {
      await onDelete(provider);
      onClose();
    }
  }, [onDelete, provider, onClose]);

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
      title={t('modal.title', { providerName: provider.name })}
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
        isLoading,
        nextAction: {
          type: 'button',
          label: t('modal.actions.delete_button_label'),
          onClick: handleDelete,
          variant: 'destructive',
          disabled: isLoading || confirmationText !== provider.name,
        },
        previousAction: {
          label: t('modal.actions.cancel_button_label'),
          onClick: onClose,
        },
      }}
    />
  );
}
