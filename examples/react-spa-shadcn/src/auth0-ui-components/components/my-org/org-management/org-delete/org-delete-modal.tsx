import { getComponentStyles } from '@auth0/web-ui-components-core';
import * as React from 'react';

import { useTheme } from '../../../../hooks/use-theme';
import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { OrgDeleteModalProps } from '../../../../types/my-org/org-management/org-delete-types';
import { Label } from '../../../ui/label';
import { Modal } from '../../../ui/modal';
import { TextField } from '../../../ui/text-field';

/**
 * OrgDeleteModal Component
 *
 * A confirmation modal for organization deletion that requires the user to type
 * the organization name to confirm the destructive action. This component handles
 * validation, error states, and provides a secure confirmation flow.
 *
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
  const { t } = useTranslator('org_management.org_delete', customMessages);
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

  const errorMessage = hasError ? t('org_name_field_error', { orgName: organizationName }) : '';

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className={cn('p-10', currentStyles.classes?.OrgDelete_modal)}
      title={t('modal_title', { orgName: organizationName })}
      content={
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {t('modal_description', { orgName: organizationName })}
          </p>

          <div className="space-y-2">
            <Label htmlFor="org-confirmation">{t('org_name_field_label')}</Label>
            <TextField
              id="org-confirmation"
              placeholder={t('org_name_field_placeholder')}
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
          label: t('delete_button_label'),
          onClick: handleConfirmDelete,
          variant: 'destructive',
          className: currentStyles.classes?.OrgDelete_button,
          disabled: isLoading,
        },
        previousAction: {
          label: t('cancel_button_label'),
          onClick: handleClose,
        },
      }}
    />
  );
}
