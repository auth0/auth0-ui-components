/**
 * SSO provider remove from organization modal.
 * @module provider-remove-modal
 * @internal
 */

import * as React from 'react';

import { SsoProviderDeleteModalContent } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete-modal-content';
import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderRemoveFromOrganizationModalProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-delete-types';

/**
 *
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @param props.isOpen - Whether the modal/dialog is open
 * @param props.onClose - Callback fired when the component should close
 * @param props.provider - SSO provider object
 * @param props.organizationName - Name of the organization
 * @param props.onRemove - Callback fired when remove action is triggered
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
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
