import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/theme-utils';
import { useTheme, useTranslator } from '@/hooks';
import { getComponentStyles } from '@auth0-web-ui-components/core';
import { OrgDeleteModalProps } from '@/types';

/**
 * OrgDeleteModal Component
 *
 * A confirmation modal for organization deletion that requires the user to type
 * the organization name to confirm the destructive action. This component handles
 * validation, error states, and provides a secure confirmation flow.
 *
 * @param {boolean} isOpen - Whether the modal is currently open/visible
 * @param {() => void} onClose - Callback fired when the modal should be closed
 * @param {string} organizationName - Name of the organization to be deleted (used for confirmation)
 * @param {() => Promise<void>} onDelete - Async callback fired when deletion is confirmed
 * @param {boolean} isLoading - Whether the delete operation is in progress
 * @param {object} [styling] - Styling configuration for customizing component appearance
 * @param {object} [styling.variables] - CSS custom properties for theming
 * @param {object} [styling.variables.common] - Common theme variables
 * @param {object} [styling.variables.light] - Light theme variables
 * @param {object} [styling.variables.dark] - Dark theme variables
 * @param {object} [styling.classes] - CSS class overrides
 * @param {string} [styling.classes['OrgDelete-modal']] - Custom CSS class for the modal container
 * @param {string} [styling.classes['OrgDelete-button']] - Custom CSS class for the delete button
 * @param {object} [customMessages={}] - Custom messages for internationalization
 * @param {string} [customMessages.modal_title] - Custom title for the confirmation modal
 * @param {string} [customMessages.modal_description] - Custom description text
 * @param {string} [customMessages.org_name_field_label] - Custom label for the confirmation input
 * @param {string} [customMessages.org_name_field_placeholder] - Custom placeholder text
 * @param {string} [customMessages.org_name_field_error] - Custom error message for validation
 * @param {string} [customMessages.delete_button_label] - Custom label for the delete button
 * @param {string} [customMessages.cancel_button_label] - Custom label for the cancel button
 *
 * @example
 * ```tsx
 * <OrgDeleteModal
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   organizationName="acme-corp"
 *   onDelete={async () => {
 *     await deleteOrganization(orgId);
 *   }}
 *   isLoading={deleteMutation.isLoading}
 *   customMessages={{
 *     modal_title: 'Delete ${orgName}',
 *     modal_description: 'This action cannot be undone.',
 *     org_name_field_error: 'Please type "${orgName}" to confirm'
 *   }}
 *   styling={{
 *     variables: {
 *       common: { '--border-radius': '12px' },
 *       light: { '--color-destructive': '#dc2626' }
 *     },
 *     classes: {
 *       'OrgDelete-modal': 'custom-modal-class',
 *       'OrgDelete-button': 'custom-button-class'
 *     }
 *   }}
 * />
 * ```
 *
 * @returns {React.JSX.Element} The rendered organization delete confirmation modal
 */
export function OrgDeleteModal({
  isOpen,
  onClose,
  organizationName,
  onDelete,
  isLoading,
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages = {},
}: OrgDeleteModalProps): React.JSX.Element {
  const { t } = useTranslator('org_management', customMessages);
  const { isDarkMode } = useTheme();

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [confirmationText, setConfirmationText] = React.useState('');
  const [hasError, setHasError] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setConfirmationText('');
    setHasError(false);
    onClose();
  }, [onClose]);

  const handleConfirmationChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmationText(e.target.value);
      if (hasError) {
        setHasError(false);
      }
    },
    [hasError],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (confirmationText.trim() !== organizationName) {
      setHasError(true);
      return;
    }

    await onDelete();
    handleClose();
  }, [confirmationText, organizationName, onDelete, handleClose]);

  const errorMessage = hasError
    ? t('org_delete.org_name_field_error', { orgName: organizationName })
    : '';

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className={cn('p-10', currentStyles.classes?.['OrgDelete-modal'])}
      title={t('org_delete.modal_title', { orgName: organizationName })}
      content={
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {t('org_delete.modal_description', { orgName: organizationName })}
          </p>

          <div className="space-y-2">
            <Label htmlFor="org-confirmation">{t('org_delete.org_name_field_label')}</Label>
            <TextField
              id="org-confirmation"
              placeholder={t('org_delete.org_name_field_placeholder')}
              value={confirmationText}
              onChange={handleConfirmationChange}
              error={hasError}
              aria-invalid={hasError}
              helperText={errorMessage}
            />
          </div>
        </div>
      }
      modalActions={{
        nextAction: {
          type: 'button',
          label: t('org_delete.delete_button_label'),
          onClick: handleConfirmDelete,
          variant: 'destructive',
          className: currentStyles.classes?.['OrgDelete-button'],
          disabled: isLoading,
        },
        previousAction: {
          label: t('org_delete.cancel_button_label'),
          onClick: handleClose,
        },
      }}
    />
  );
}
