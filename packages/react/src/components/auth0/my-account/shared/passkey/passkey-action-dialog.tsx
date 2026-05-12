/**
 * Combined passkey action dialog (rename or revoke).
 * @module passkey-action-dialog
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  PasskeyActionDialogProps,
  UserPasskeyMgmtProps,
} from '@/types/my-account/passkey/passkey-types';

const DEFAULT_STYLING: UserPasskeyMgmtProps['styling'] = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * Combined passkey action dialog (rename or revoke).
 * @param props - Dialog props including mode, open state, and action callbacks.
 * @returns The passkey action dialog component.
 */
export function PasskeyActionDialog(props: PasskeyActionDialogProps) {
  const {
    mode,
    open,
    onOpenChange,
    isPending,
    onCancel,
    styling = DEFAULT_STYLING,
    customMessages = {},
  } = props;

  const { t } = useTranslator('passkey', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const initialName = mode === 'rename' ? (props.initialName ?? '') : '';
  const [name, setName] = React.useState(initialName);

  React.useEffect(() => {
    if (open) {
      setName(mode === 'rename' ? (props.initialName ?? '') : '');
    }
  }, [open]);

  const handleConfirm = React.useCallback(async () => {
    if (mode === 'rename') {
      if (!name.trim()) return;
      await props.onConfirm(name.trim());
    } else {
      await props.onConfirm();
    }
  }, [mode, name, props]);

  const dialogContentClass =
    mode === 'rename'
      ? currentStyles.classes?.['RenamePasskey-dialogContent']
      : currentStyles.classes?.['RevokePasskeyConfirmation-dialogContent'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={currentStyles?.variables}
        className={cn('w-[400px] max-h-[90vh]', dialogContentClass)}
      >
        <DialogHeader>
          <DialogTitle className="text-(length:--font-size-title) font-medium">
            {t(mode === 'rename' ? 'rename_passkey_title' : 'revoke_passkey_title')}
          </DialogTitle>
        </DialogHeader>

        {mode === 'rename' ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rename-passkey-input">{t('rename_passkey_label')}</Label>
              <TextField
                id="rename-passkey-input"
                placeholder={t('rename_passkey_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="flex flex-row justify-end gap-3 mt-4 mb-2">
              <Button
                variant="outline"
                size="default"
                className="text-sm"
                onClick={onCancel}
                disabled={isPending}
                aria-label={t('cancel')}
              >
                {t('cancel')}
              </Button>
              <Button
                size="default"
                className="text-sm"
                onClick={handleConfirm}
                disabled={isPending || !name.trim()}
                aria-label={t('save')}
              >
                {isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col mt-4">
            <p className="text-(length:--font-size-paragraph) font-normal mb-8 text-primary">
              <>
                {t.trans('revoke_passkey_consent', {
                  components: {
                    bold: (children: string) => <strong key="passkey-name">{children}</strong>,
                  },
                  vars: { name: props.passKeyName ?? '' },
                })}
              </>
            </p>
            <div className="flex flex-row justify-end gap-3 mb-2">
              <Button
                variant="outline"
                size="default"
                className="text-sm"
                onClick={onCancel}
                disabled={isPending}
                aria-label={t('cancel')}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                size="default"
                className="text-sm"
                onClick={handleConfirm}
                disabled={isPending}
                aria-label={t('confirm')}
              >
                {isPending ? t('revoking') : t('confirm')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
