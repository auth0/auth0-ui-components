/**
 * Confirmation shown before the guided setup creates the provider.
 * @module sso-guided-setup-create-modal
 * @internal
 */

import { FormActions } from '@/components/auth0/shared/form-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoGuidedSetupCreateModalProps } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isCreating) onOpenChange(next);
      }}
    >
      <DialogContent className="gap-6 p-10" showCloseButton={!isCreating}>
        <DialogHeader className="gap-6">
          <DialogTitle>{t('create_modal.title')}</DialogTitle>
          <DialogDescription>{t('create_modal.description', { companyName })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <FormActions
            isLoading={isCreating}
            showUnsavedChanges={false}
            previousAction={{
              label: t('create_modal.cancel'),
              variant: 'outline',
              onClick: () => onOpenChange(false),
            }}
            nextAction={{
              type: 'button',
              label: t('create_modal.proceed'),
              variant: 'primary',
              onClick: onProceed,
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
