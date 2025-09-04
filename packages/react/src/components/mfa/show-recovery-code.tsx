import * as React from 'react';
import { getComponentStyles, FACTOR_TYPE_PUSH_NOTIFICATION } from '@auth0-web-ui-components/core';

import { Button } from '@/components/ui/button';
import { CopyableTextField } from '@/components/ui/copyable-text-field';

import { useTheme, useTranslator, useOtpConfirmation } from '@/hooks';
import { cn } from '@/lib/theme-utils';
import { ShowRecoveryCodeProps } from '@/types';

export function ShowRecoveryCode({
  factorType,
  confirmEnrollment,
  onError,
  onSuccess,
  onClose,
  oobCode,
  userOtp,
  recoveryCodes,
  onBack,
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
}: ShowRecoveryCodeProps) {
  const { t } = useTranslator('mfa');
  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const isPushNotification = factorType === FACTOR_TYPE_PUSH_NOTIFICATION;

  const { onSubmitOtp, loading } = useOtpConfirmation({
    factorType: factorType,
    confirmEnrollment: confirmEnrollment!,
    onError: onError!,
    onSuccess,
    onClose: onClose!,
  });

  const handleSubmit = React.useCallback(async () => {
    if (isPushNotification) {
      onSuccess();
    } else if (userOtp) {
      await onSubmitOtp({ userOtp }, oobCode);
    }
  }, [isPushNotification, onSubmitOtp, userOtp, oobCode, onSuccess]);

  const buttonText = loading ? t('enrollment_form.show_otp.verifying') : t('submit');

  return (
    <div style={currentStyles.variables} className="w-full max-w-sm mx-auto text-center">
      <div className="space-y-6">
        <div>
          <p
            className={cn(
              'font-normal block text-sm text-center text-(length:--font-size-paragraph) mb-4',
            )}
          >
            {t('enrollment_form.recovery_code_description')}
          </p>
          {recoveryCodes.length > 0 && <CopyableTextField value={recoveryCodes[0]} />}
        </div>

        <div className="flex flex-col gap-3 justify-center">
          <Button
            type="button"
            className="text-sm"
            size="lg"
            disabled={!isPushNotification && loading}
            onClick={handleSubmit}
            aria-label={buttonText}
          >
            {buttonText}
          </Button>
          <Button
            type="button"
            className="text-sm"
            variant="ghost"
            size="lg"
            onClick={onBack}
            aria-label={t('back')}
          >
            {t('back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
