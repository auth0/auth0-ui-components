/**
 * Recovery code display component.
 * @module show-recovery-code
 * @internal
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { ShowRecoveryCodeProps } from '@/types/my-account/user-mfa-management/factor-enrollment-types';

/**
 *
 * @param props - Component props.
 * @param props.recoveryCode - Recovery code to display
 * @param props.isLoading - Whether an async operation is in progress
 * @param props.onConfirmRecoveryCode - Called when the user confirms they've saved the code
 * @param props.onClose - Callback fired when the component should close
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function ShowRecoveryCode({
  recoveryCode,
  isLoading,
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
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    setConfirmed(false);
  }, [recoveryCode]);
  const { t } = useTranslator('user_mfa_management', customMessages);
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div style={currentStyles.variables} className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="font-normal block text-sm text-center mb-4 text-primary">
              {t('enrollment.recovery_code.description')}
            </p>
            <CopyableTextField value={recoveryCode} />
          </div>

          <div className="flex items-center gap-4">
            <Checkbox
              id="recovery-code-confirmed"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="recovery-code-confirmed"
              className="text-sm text-primary cursor-pointer"
            >
              {t('enrollment.recovery_code.confirmed')}
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="text-sm"
              variant="outline"
              size="default"
              onClick={onClose}
              aria-label={t('actions.back_button_label')}
            >
              {t('actions.back_button_label')}
            </Button>

            <Button
              type="button"
              className="text-sm"
              size="default"
              onClick={onConfirmRecoveryCode}
              disabled={!confirmed}
              aria-label={t('actions.submit_button_label')}
            >
              {t('actions.submit_button_label')}
            </Button>
          </DialogFooter>
        </div>
      )}
    </div>
  );
}
