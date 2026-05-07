/**
 * Recovery code display component.
 * @module show-recovery-code
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ShowRecoveryCodeProps } from '@/types/my-account/mfa/mfa-types';

/**
 *
 * @param props - Component props.
 * @param props.recoveryCode - Recovery code to display
 * @param props.isEnrolling - Whether enrollment (code fetch) is in progress
 * @param props.isConfirming - Whether confirmation is in progress
 * @param props.onConfirmRecoveryCode - Called when the user confirms they've saved the code
 * @param props.onClose - Callback fired when the component should close
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ShowRecoveryCode({
  recoveryCode,
  isEnrolling,
  isConfirming,
  onConfirmRecoveryCode,
  onClose,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  customMessages = {},
}: ShowRecoveryCodeProps) {
  const { t } = useTranslator('mfa', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto text-center">
      {isEnrolling || isConfirming ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="font-normal block text-sm text-center mb-4 text-primary">
              {t('enrollment_form.recovery_code_description')}
            </p>
            <CopyableTextField value={recoveryCode} />
          </div>

          <div className="flex flex-row justify-end gap-3 mt-6 mb-6">
            <Button
              type="button"
              className="text-sm"
              variant="outline"
              size="default"
              onClick={onClose}
              aria-label={t('back')}
            >
              {t('back')}
            </Button>

            <Button
              type="button"
              className="text-sm"
              size="default"
              onClick={onConfirmRecoveryCode}
            >
              {t('submit')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
