import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks';
import type { MFAType, MergedStyles } from '@auth0-web-ui-components/core';
import { cn } from '@/lib/theme-utils';

type DeleteFactorConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factorToDelete: {
    id: string;
    type: MFAType;
  } | null;
  isDeletingFactor: boolean;
  onConfirm: (factorId: string) => void;
  onCancel: () => void;
  styling?: MergedStyles;
};

export function DeleteFactorConfirmation({
  open,
  onOpenChange,
  factorToDelete,
  isDeletingFactor,
  onConfirm,
  onCancel,
  styling = {},
}: DeleteFactorConfirmationProps) {
  const { t } = useTranslator('mfa');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      aria-modal="true"
      aria-labelledby="delete-mfa-title"
      aria-describedby="delete-mfa-description"
    >
      <DialogContent
        style={styling}
        aria-describedby="delete-mfa-description"
        className="w-[400px] h-[548px]"
      >
        <DialogHeader>
          <DialogTitle
            id="delete-mfa-title"
            className="text-center text-(length:--font-size-title) font-medium"
          >
            {t('delete_mfa_title')}
          </DialogTitle>
          <Separator className="my-2" />
        </DialogHeader>

        <div className="flex flex-col items-center justify-center flex-1 space-y-10">
          <p
            id="delete-mfa-description"
            className={cn(
              'text-center text-primary text-(length:--font-size-paragraph) font-normal',
            )}
          >
            {t(`delete_mfa_${factorToDelete?.type}_consent`)}
          </p>

          <div className="flex flex-col space-y-3 w-full">
            <Button
              variant="destructive"
              size="lg"
              className="text-sm"
              onClick={() => factorToDelete && onConfirm(factorToDelete.id)}
              disabled={isDeletingFactor}
              aria-label={t('confirm')}
            >
              {isDeletingFactor ? t('deleting') : t('confirm')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-sm"
              onClick={onCancel}
              disabled={isDeletingFactor}
              aria-label={t('cancel')}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
