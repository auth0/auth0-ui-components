import * as React from 'react';

import { SsoProviderDeleteModalContent } from '../sso-provider-delete/provider-delete-modal-content';

import { Modal } from '@/components/auth0/shared/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderRemoveFromOrganizationModalProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-delete-types';

export function SsoProviderRemoveFromOrganizationModal({
  className,
  isOpen,
  onClose,
  provider,
  organizationName,
  onRemove,
  isLoading = false,
  customMessages = {},
}: SsoProviderRemoveFromOrganizationModalProps) {
  const { t } = useTranslator('idp_management.remove_sso_provider', customMessages);
  const [confirmationText, setConfirmationText] = React.useState('');

  const handleModalContentChange = React.useCallback((value: string) => {
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
            <>
              {t.trans('modal.description', {
                components: {
                  bold: (children: string) => <strong key="provider-name">{children}</strong>,
                },
                vars: { providerName: provider.name },
              })}
            </>
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
