/**
 * MFA factor deletion modal.
 * @module factor-delete-modal
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { FactorDeleteModalProps } from '@/types/my-account/user-mfa-management/factor-delete-modal-types';

/**
 *
 * @param props - Component props.
 * @param props.open - Whether the component is open/visible
 * @param props.onOpenChange - Callback fired when open state changes
 * @param props.factorToDelete - The factor selected for deletion
 * @param props.isDeletingFactor - Whether a factor deletion is in progress
 * @param props.onConfirm - Callback fired when the action is confirmed
 * @param props.onCancel - Callback fired when the operation is cancelled
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function FactorDeleteModal({
  open,
  onOpenChange,
  factorToDelete,
  isDeletingFactor,
  onConfirm,
  onCancel,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: FactorDeleteModalProps) {
  const { t } = useTranslator('user_mfa_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={currentStyles?.variables}
        className={cn(
          'w-[600px] min-h-44 max-h-[90vh] gap-4',
          currentStyles.classes?.['FactorDeleteModal-dialogContent'],
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-left text-(length:--font-size-title) font-medium">
            {t('remove_factor_dialog.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('remove_factor_dialog.title')}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <p className="text-center text-(length:--font-size-paragraph) font-normal text-primary">
          {factorToDelete?.type && t(`remove_factor_dialog.consent.${factorToDelete.type}`)}
        </p>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            size="default"
            className="text-sm"
            onClick={onCancel}
            disabled={isDeletingFactor}
            aria-label={t('actions.cancel_button_label')}
          >
            {t('actions.cancel_button_label')}
          </Button>
          <Button
            variant="destructive"
            size="default"
            className="text-sm"
            onClick={() => void onConfirm()}
            disabled={isDeletingFactor}
            aria-label={t('actions.confirm_button_label')}
          >
            {isDeletingFactor
              ? t('actions.deleting_button_text')
              : t('actions.confirm_button_label')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
