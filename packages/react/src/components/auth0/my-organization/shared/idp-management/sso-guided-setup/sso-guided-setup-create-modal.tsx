/**
 * Confirmation shown before the guided setup creates the provider.
 * @module sso-guided-setup-create-modal
 * @internal
 */

import type { SsoGuidedSetupMessages } from '@auth0/universal-components-core';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';

export interface SsoGuidedSetupCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  isCreating?: boolean;
  companyName: string;
  customMessages?: Partial<SsoGuidedSetupMessages>;
}

/**
 * Warns that creating the provider enables SSO access
 * @param props - Component props.
 * @param props.open - Whether the modal is open.
 * @param props.onOpenChange - Called to open or close the modal.
 * @param props.onProceed - Called when the administrator proceeds.
 * @param props.isCreating - Show the proceed button as loading.
 * @param props.companyName - Value for `${companyName}`.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoGuidedSetupCreateModal({
  open,
  onOpenChange,
  onProceed,
  isCreating = false,
  companyName,
  customMessages = {},
}: SsoGuidedSetupCreateModalProps) {
  const { t } = useTranslator('idp_management.sso_guided_setup', customMessages);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!isCreating) onOpenChange(next);
      }}
      title={t('create_modal.title')}
      description={t('create_modal.description', { companyName })}
      showCloseButton={!isCreating}
      modalActions={{
        isLoading: isCreating,
        previousAction: {
          label: t('create_modal.cancel'),
          variant: 'outline',
          onClick: () => onOpenChange(false),
        },
        nextAction: {
          type: 'button',
          label: t('create_modal.proceed'),
          variant: 'primary',
          onClick: onProceed,
        },
      }}
    />
  );
}
