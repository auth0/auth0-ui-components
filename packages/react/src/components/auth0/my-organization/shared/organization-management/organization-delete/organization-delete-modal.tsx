/**
 * Organization deletion confirmation modal.
 * @module organization-delete-modal
 * @internal
 */

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { OrganizationDeleteModalProps } from '@/types/my-organization/organization-management/organization-delete-types';

const CONFIRMATION_FIELD_ID = 'organization-delete-confirmation';
const CONFIRMATION_ERROR_ID = 'organization-delete-confirmation-error';

/**
 * Asks the user to type the organization name before deleting it.
 * @param props - Component props.
 * @param props.className - Optional CSS class name for styling
 * @param props.isOpen - Whether the modal is open
 * @param props.onClose - Callback fired when the modal should close
 * @param props.organization - Organization to delete
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.isLoading - Whether the delete request is in flight
 * @param props.onDelete - Callback fired when deletion is confirmed
 * @returns JSX element
 */
export function OrganizationDeleteModal({
  className,
  isOpen,
  onClose,
  organization,
  customMessages = {},
  isLoading,
  onDelete,
}: OrganizationDeleteModalProps) {
  const { t } = useTranslator('organization_management.organization_delete', customMessages);
  const [confirmationText, setConfirmationText] = React.useState('');

  const organizationName = organization.display_name || organization.name;
  const isConfirmed = confirmationText === organization.name;
  const showMismatchError = confirmationText !== '' && !isConfirmed;

  React.useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const handleDelete = React.useCallback(async () => {
    if (await onDelete()) {
      onClose();
    }
  }, [onDelete, onClose]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn('p-10', className)}
      title={t('modal_title', { organizationName })}
      content={
        <div className="space-y-6">
          <p className="text-muted-foreground text-paragraph">
            {t('modal_description', { organizationName })}
          </p>
          <div>
            <Label htmlFor={CONFIRMATION_FIELD_ID} className="text-label font-medium">
              {t('organization_name_field_label')}
            </Label>
            <TextField
              id={CONFIRMATION_FIELD_ID}
              type="text"
              autoComplete="off"
              value={confirmationText}
              placeholder={t('organization_name_field_placeholder')}
              onChange={(event) => setConfirmationText(event.target.value)}
              error={showMismatchError}
              aria-invalid={showMismatchError}
              aria-describedby={showMismatchError ? CONFIRMATION_ERROR_ID : undefined}
              className="mt-2"
            />
            {showMismatchError && (
              <p
                id={CONFIRMATION_ERROR_ID}
                className="text-destructive-foreground mt-1.5 px-2 text-xs"
              >
                {t('organization_name_field_error', { organizationName: organization.name })}
              </p>
            )}
          </div>
        </div>
      }
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: t('delete_button_label'),
          variant: 'destructive',
          disabled: isLoading || !isConfirmed,
          onClick: handleDelete,
        },
        previousAction: {
          label: t('cancel_button_label'),
          disabled: isLoading,
          onClick: onClose,
        },
      }}
    />
  );
}
