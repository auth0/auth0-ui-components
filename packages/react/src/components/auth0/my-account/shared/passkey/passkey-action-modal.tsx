/**
 * Combined passkey action modal (rename or revoke).
 * @module passkey-action-modal
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { PasskeyActionModalProps } from '@/types/my-account/passkey/passkey-types';

const DEFAULT_STYLING: PasskeyActionModalProps['styling'] = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

const NAMESPACE_MAP = {
  rename: 'passkey.modals.rename',
  revoke: 'passkey.modals.revoke',
} as const;

/**
 * Combined passkey action modal (rename or revoke).
 * @param props - Modal props including mode, open state, and action callbacks.
 * @returns The passkey action modal component.
 */
export function PasskeyActionModal(props: PasskeyActionModalProps) {
  const {
    mode,
    open,
    onOpenChange,
    onConfirm,
    isPending,
    name: passkeyName,
    styling = DEFAULT_STYLING,
    customMessages = {},
  } = props;

  const { t } = useTranslator(NAMESPACE_MAP[mode], customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [name, setName] = React.useState(passkeyName ?? '');

  React.useEffect(() => {
    if (open && mode === 'rename') {
      setName(passkeyName ?? '');
    }
  }, [open, mode, passkeyName]);

  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (mode === 'rename') {
      if (!name.trim()) return;
      await onConfirm(name.trim());
    } else {
      await onConfirm();
    }
  }, [mode, name, onConfirm]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!isPending) onOpenChange(open);
    },
    [isPending, onOpenChange],
  );

  const content =
    mode === 'rename' ? (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rename-passkey-input">{t('label')}</Label>
        <TextField
          id="rename-passkey-input"
          placeholder={t('placeholder')}
          value={name}
          onChange={handleNameChange}
          disabled={isPending}
        />
      </div>
    ) : (
      <p className="text-(length:--font-size-paragraph) font-normal text-primary">
        <>
          {t.trans('consent', {
            components: {
              bold: (children: string) => <strong key="passkey-name">{children}</strong>,
            },
            vars: { name: passkeyName ?? '' },
          })}
        </>
      </p>
    );

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      className={cn(currentStyles.classes?.['PasskeyActionModal-modalContent'])}
      title={t('title')}
      content={content}
      modalActions={{
        isLoading: isPending,
        nextAction: {
          type: 'button',
          label: mode === 'rename' ? t('update') : t('confirm'),
          onClick: handleConfirm,
          variant: mode === 'revoke' ? 'destructive' : 'primary',
          disabled: isPending || (mode === 'rename' && !name.trim()),
        },
        previousAction: {
          label: t('cancel'),
          onClick: () => handleOpenChange(false),
        },
      }}
    />
  );
}
