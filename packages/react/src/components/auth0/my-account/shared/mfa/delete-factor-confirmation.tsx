import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { DeleteFactorConfirmationProps } from '@/types/my-account/mfa/mfa-types';

export function DeleteFactorConfirmation({
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
}: DeleteFactorConfirmationProps) {
  const { t } = useTranslator('mfa', customMessages);
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
          'w-[400px] max-h-[90vh]',
          currentStyles.classes?.['DeleteFactorConfirmation-dialogContent'],
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-(length:--font-size-title) font-medium">
            {t('delete_mfa_title')}
          </DialogTitle>
          <Separator className="my-2" />
        </DialogHeader>

        <div className="flex flex-col items-center mt-6">
          <p
            className={cn(
              'text-center text-(length:--font-size-paragraph) font-normal mb-10 text-primary',
            )}
          >
            {t(`delete_mfa_${factorToDelete?.type}_consent`)}
          </p>

          <div className="flex flex-row justify-end gap-3 w-full mt-6 mb-6">
            <Button
              variant="outline"
              size="default"
              className="text-sm"
              onClick={onCancel}
              disabled={isDeletingFactor}
              aria-label={t('cancel')}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              size="default"
              className="text-sm"
              onClick={() => factorToDelete && onConfirm(factorToDelete.id)}
              disabled={isDeletingFactor}
              aria-label={t('confirm')}
            >
              {isDeletingFactor ? t('deleting') : t('confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
