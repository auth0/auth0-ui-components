/**
 * Passkey revoke confirmation modal.
 * @module passkey-action-modal
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { Modal } from '@/components/ui/modal';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { PasskeyActionModalProps } from '@/types/my-account/user-passkey-management/user-passkey-management-types';

const DEFAULT_STYLING: PasskeyActionModalProps['styling'] = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * Passkey revoke confirmation modal.
 * @param props - Modal props including open state and action callbacks.
 * @returns The passkey action modal component.
 */
export function PasskeyActionModal(props: PasskeyActionModalProps) {
  const {
    open,
    onOpenChange,
    onConfirm,
    isPending,
    name: passkeyName,
    styling = DEFAULT_STYLING,
    customMessages = {},
  } = props;

  const { t } = useTranslator('passkey.modals.revoke', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!isPending) onOpenChange(open);
    },
    [isPending, onOpenChange],
  );

  const content = (
    <p className="text-paragraph font-normal text-primary">
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
          label: t('confirm'),
          onClick: onConfirm,
          variant: 'destructive',
          disabled: isPending,
        },
        previousAction: {
          label: t('cancel'),
          onClick: () => handleOpenChange(false),
        },
      }}
    />
  );
}
